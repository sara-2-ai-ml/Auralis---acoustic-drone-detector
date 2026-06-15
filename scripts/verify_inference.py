"""
Verify ONNX inference against librosa preprocessing (Python training reference).

Usage:
  pip install librosa soundfile onnxruntime numpy
  python scripts/verify_inference.py public/test_drone.wav public/test_nodrone.wav

Expected:
  test_drone.wav   -> Drone Detected (high confidence)
  test_nodrone.wav -> No Drone (low drone-class confidence)
"""
from __future__ import annotations

import sys
from pathlib import Path

import librosa
import numpy as np
import onnxruntime as ort

SAMPLE_RATE = 16000
N_MELS = 64
N_FRAMES = 32
N_FFT = 512
HOP_LENGTH = 256
TARGET_SAMPLES = N_FFT + (N_FRAMES - 1) * HOP_LENGTH
EPS = 1e-10
MODEL_PATH = Path(__file__).resolve().parents[1] / "public" / "model.onnx"


def preprocess(path: Path) -> np.ndarray:
    y, _ = librosa.load(path, sr=SAMPLE_RATE, mono=True)

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
    assert mel_db.shape == (N_MELS, N_FRAMES), mel_db.shape

    mel_spec = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-8)
    print("mel_spec shape (before flatten):", mel_spec.shape)
    print("mel_spec[0, :32] (first mel bin, all frames):", mel_spec[0, :32])
    print("mel_spec[:10, 0] (first frame, first 10 mel bins):", mel_spec[:10, 0])
    print(f"{path.name} mel sample:", mel_spec.flatten()[:10])
    print(f"{path.name} mel min/max:", float(mel_spec.min()), float(mel_spec.max()))
    return mel_spec.astype(np.float32)


def run(path: Path, session: ort.InferenceSession) -> None:
    mel = preprocess(path)
    logits = session.run(None, {"input": mel[None, None, :, :]})[0][0]
    exp = np.exp(logits - logits.max())
    probs = exp / exp.sum()
    drone_conf = float(probs[1])
    label = "Drone Detected" if drone_conf > 0.5 else "No Drone"
    print(f"{path.name} -> {label} (drone confidence={drone_conf:.4f})\n")


def main() -> None:
    if len(sys.argv) < 2:
        print("Provide one or more .wav paths")
        sys.exit(1)

    session = ort.InferenceSession(MODEL_PATH.as_posix(), providers=["CPUExecutionProvider"])
    for wav in sys.argv[1:]:
        run(Path(wav), session)


if __name__ == "__main__":
    main()
