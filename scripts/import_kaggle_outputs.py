"""
Import Kaggle notebook outputs into this repo.

Usage:
  python scripts/import_kaggle_outputs.py "C:/path/to/kaggle/working"
  python scripts/import_kaggle_outputs.py "/kaggle/working"

Then:
  npm run metrics
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRAINING_PUBLIC = ROOT / "public" / "training"
DATA = ROOT / "data"

# Kaggle filename -> local public/training path
IMAGE_MAP = {
    "training_curves_v3.png": "training-curves.png",
    "training_curves.png": "training-curves.png",
    "training_curves_v2.png": "training-curves.png",
    "confusion_matrix_v3.png": "confusion-matrix.png",
    "confusion_matrix.png": "confusion-matrix.png",
    "confusion_matrix_v2.png": "confusion-matrix.png",
    "augmentation_example.png": "spectrogram-compare.png",
    "data_exploration.png": "data-exploration.png",
    "streaming_simulation.png": "latency-chart.png",
    "chunking_comparison.png": "chunking-comparison.png",
    "duration_distribution.png": "duration-distribution.png",
    "duration_by_class.png": "duration-by-class.png",
}

MODEL_MAP = {
    "model.onnx": ROOT / "public" / "model.onnx",
    "model_quant.onnx": ROOT / "public" / "model_quant.onnx",
}


def first_existing(src: Path, names: list[str]) -> Path | None:
    for name in names:
        candidate = src / name
        if candidate.exists():
            return candidate
    return None


def copy_images(src: Path) -> list[str]:
    TRAINING_PUBLIC.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    used_targets: set[str] = set()

    for kaggle_name, local_name in IMAGE_MAP.items():
        if local_name in used_targets:
            continue
        path = src / kaggle_name
        if not path.exists():
            continue
        dest = TRAINING_PUBLIC / local_name
        shutil.copy2(path, dest)
        copied.append(local_name)
        used_targets.add(local_name)
        print(f"  image: {kaggle_name} -> public/training/{local_name}")

    return copied


def copy_models(src: Path) -> list[str]:
    copied: list[str] = []
    for name, dest in MODEL_MAP.items():
        path = src / name
        if not path.exists():
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        if name == "model.onnx":
            api_dest = ROOT / "drone-detector-api" / "model.onnx"
            shutil.copy2(path, api_dest)
        copied.append(name)
        print(f"  model: {name} -> {dest.relative_to(ROOT)}")
    return copied


def copy_history(src: Path) -> bool:
    for name in ("training_history.json", "metrics_export.json"):
        path = src / name
        if not path.exists():
            continue
        DATA.mkdir(parents=True, exist_ok=True)
        dest = DATA / "training_history.json"
        if name == "metrics_export.json":
            payload = json.loads(path.read_text(encoding="utf-8"))
            dest.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        else:
            shutil.copy2(path, dest)
        print(f"  metrics: {name} -> data/training_history.json")
        return True
    return False


def write_assets_manifest(images: list[str]) -> None:
    manifest = {
        "training_curves": "/training/training-curves.png",
        "confusion_matrix": "/training/confusion-matrix.png",
        "spectrogram_compare": "/training/spectrogram-compare.png",
        "latency_chart": "/training/latency-chart.png",
        "imported": images,
    }
    out = TRAINING_PUBLIC / "manifest.json"
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"  manifest -> {out.relative_to(ROOT)}")


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_kaggle_outputs.py <kaggle/working/path>")
        sys.exit(1)

    src = Path(sys.argv[1]).expanduser().resolve()
    if not src.is_dir():
        print(f"Not a directory: {src}")
        sys.exit(1)

    print(f"Importing from {src}\n")
    images = copy_images(src)
    models = copy_models(src)
    has_history = copy_history(src)

    if images:
        write_assets_manifest(images)
    else:
        print("  No PNG files matched — check IMAGE_MAP in import script.")

    if not has_history:
        print(
            "\n  No training_history.json found."
            "\n  Run scripts/kaggle_export_cell.py in your Kaggle notebook last cell,"
            "\n  download training_history.json, and re-run import."
        )

    print(f"\nDone. Imported {len(images)} images, {len(models)} models.")
    print("Next: npm run metrics")


if __name__ == "__main__":
    main()
