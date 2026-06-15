"""
Benchmark verifiable model metrics and write public/metrics.json.

Usage:
  pip install librosa soundfile onnxruntime numpy
  python scripts/benchmark_metrics.py

Optional: place training exports at data/training_history.json
Optional: eval clips listed in data/eval_manifest.json
"""
from __future__ import annotations

import json
import platform
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path

import librosa
import numpy as np
import onnxruntime as ort

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DATA = ROOT / "data"
MODEL_FP32 = PUBLIC / "model.onnx"
MODEL_QUANT = PUBLIC / "model_quant.onnx"
HISTORY_PATH = DATA / "training_history.json"
EVAL_PATH = DATA / "eval_manifest.json"
OUT_PATH = PUBLIC / "metrics.json"

SAMPLE_RATE = 16000
N_MELS = 64
N_FRAMES = 32
N_FFT = 512
HOP_LENGTH = 256
TARGET_SAMPLES = N_FFT + (N_FRAMES - 1) * HOP_LENGTH
EPS = 1e-10
WARMUP = 10
INFERENCE_RUNS = 100
PIPELINE_RUNS = 30


def preprocess_array(y: np.ndarray) -> np.ndarray:
    y = y.astype(np.float32)
    if len(y) >= TARGET_SAMPLES:
        start = (len(y) - TARGET_SAMPLES) // 2
        y = y[start : start + TARGET_SAMPLES]
    else:
        y = np.pad(y, (0, TARGET_SAMPLES - len(y)))

    mel = librosa.feature.melspectrogram(
        y=y,
        sr=SAMPLE_RATE,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        win_length=N_FFT,
        n_mels=N_MELS,
        center=False,
        power=2.0,
    )
    mel_db = librosa.power_to_db(mel, ref=1.0, amin=EPS)
    mel_spec = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-8)
    return mel_spec.astype(np.float32)


def preprocess_file(path: Path) -> np.ndarray:
    y, _ = librosa.load(path, sr=SAMPLE_RATE, mono=True)
    return preprocess_array(y)


def predict_drone_conf(session: ort.InferenceSession, mel: np.ndarray) -> float:
    logits = session.run(None, {"input": mel[None, None, :, :]})[0][0]
    exp = np.exp(logits - logits.max())
    probs = exp / exp.sum()
    return float(probs[1])


def percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = min(len(ordered) - 1, max(0, int(round((p / 100) * (len(ordered) - 1)))))
    return ordered[idx]


def benchmark_latency(session: ort.InferenceSession, mel: np.ndarray) -> dict:
    tensor = mel[None, None, :, :]

    for _ in range(WARMUP):
        session.run(None, {"input": tensor})

    infer_ms = []
    for _ in range(INFERENCE_RUNS):
        t0 = time.perf_counter()
        session.run(None, {"input": tensor})
        infer_ms.append((time.perf_counter() - t0) * 1000)

    pipeline_ms = []
    sample_path = PUBLIC / "test_drone.wav"
    for _ in range(PIPELINE_RUNS):
        t0 = time.perf_counter()
        mel_run = preprocess_file(sample_path)
        session.run(None, {"input": mel_run[None, None, :, :]})
        pipeline_ms.append((time.perf_counter() - t0) * 1000)

    return {
        "inference_ms": {
            "mean": round(statistics.mean(infer_ms), 2),
            "p50": round(percentile(infer_ms, 50), 2),
            "p95": round(percentile(infer_ms, 95), 2),
        },
        "pipeline_ms": {
            "mean": round(statistics.mean(pipeline_ms), 2),
            "p50": round(percentile(pipeline_ms, 50), 2),
            "p95": round(percentile(pipeline_ms, 95), 2),
        },
    }


def evaluate_manifest(session: ort.InferenceSession) -> dict | None:
    if not EVAL_PATH.exists():
        return None

    entries = json.loads(EVAL_PATH.read_text(encoding="utf-8"))
    tp = fp = tn = fn = 0

    for entry in entries:
        path = ROOT / entry["path"]
        label = int(entry["label"])
        conf = predict_drone_conf(session, preprocess_file(path))
        pred = 1 if conf > 0.5 else 0

        if label == 1 and pred == 1:
            tp += 1
        elif label == 0 and pred == 1:
            fp += 1
        elif label == 0 and pred == 0:
            tn += 1
        else:
            fn += 1

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall)
        else 0.0
    )
    accuracy = (tp + tn) / len(entries) if entries else 0.0

    return {
        "samples": len(entries),
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_macro": round(f1, 4),
        "confusion": {"tp": tp, "fp": fp, "tn": tn, "fn": fn},
    }


def load_history() -> dict | None:
    if not HISTORY_PATH.exists():
        return None
    return json.loads(HISTORY_PATH.read_text(encoding="utf-8"))


def model_size_mb(path: Path) -> float | None:
    if not path.exists():
        return None
    return round(path.stat().st_size / (1024 * 1024), 2)


def build_metrics() -> dict:
    session = ort.InferenceSession(
        MODEL_FP32.as_posix(), providers=["CPUExecutionProvider"]
    )
    latency = benchmark_latency(session, preprocess_file(PUBLIC / "test_drone.wav"))
    eval_result = evaluate_manifest(session)
    history = load_history()

    fp32_mb = model_size_mb(MODEL_FP32)
    quant_mb = model_size_mb(MODEL_QUANT)

    val_curve = None
    training_hours = None
    test_f1 = None
    test_f1_source = None

    if history:
        val_curve = history.get("validation_accuracy")
        training_hours = history.get("training_audio_hours")
        if history.get("test_f1_macro") is not None:
            test_f1 = history["test_f1_macro"]
            test_f1_source = "training_history.json"

    if eval_result and test_f1 is None:
        test_f1 = eval_result["f1_macro"]
        test_f1_source = f"eval_manifest.json (n={eval_result['samples']})"

    deployed_mb = quant_mb if quant_mb is not None else fp32_mb
    deployed_label = (
        "model_quant.onnx (INT8)"
        if quant_mb is not None
        else "model.onnx (FP32)"
    )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "platform": {
            "system": platform.system(),
            "machine": platform.machine(),
            "processor": platform.processor() or "unknown",
            "provider": "ONNX Runtime CPUExecutionProvider",
        },
        "f1_score": {
            "value": test_f1,
            "source": test_f1_source,
            "detail": (
                history.get("f1_detail", "macro avg, held-out test set")
                if history
                else (
                    f"macro F1 on {eval_result['samples']} labeled clips"
                    if eval_result
                    else "add data/training_history.json or data/eval_manifest.json"
                )
            ),
        },
        "validation_accuracy": val_curve,
        "latency_ms": {
            "value": latency["pipeline_ms"]["p50"],
            "detail": f"preprocess + ONNX, p50 on {platform.system()} CPU",
            "breakdown": latency,
        },
        "model_size_mb": {
            "value": deployed_mb,
            "fp32_mb": fp32_mb,
            "quant_mb": quant_mb,
            "detail": deployed_label,
            "compression_ratio": (
                round(fp32_mb / quant_mb, 2)
                if fp32_mb and quant_mb
                else None
            ),
        },
        "training_audio_hours": {
            "value": training_hours,
            "detail": (
                history.get("training_audio_detail", "UAV + ambient + augmented")
                if history
                else "set training_audio_hours in data/training_history.json"
            ),
        },
        "evaluation": eval_result,
    }


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    metrics = build_metrics()
    OUT_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
