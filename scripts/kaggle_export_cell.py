"""
Paste this as the LAST cell in your Kaggle notebook, after training/eval.
Adjust variable names to match your notebook (history, val_accs, f1, etc.).
Writes /kaggle/working/training_history.json for import into the website repo.
"""
# --- copy from here into Kaggle ---

import json

# TODO: replace with your notebook variables
# Example names — adapt to what you already have:
# val_accs = history["val_accuracy"]  # or per-epoch list
# test_f1 = f1_score(y_true, y_pred, average="macro")
# total_audio_hours = sum(durations) / 3600

export = {
    "test_f1_macro": float(test_f1),  # noqa: F821 — defined in notebook
    "f1_detail": "macro avg, held-out test set (Kaggle v3)",
    "validation_accuracy": [float(v) for v in val_accs],  # noqa: F821
    "training_audio_hours": float(total_audio_hours),  # noqa: F821
    "confusion_matrix": confusion_matrix.tolist(),  # noqa: F821 — optional
    "model_version": "v3",
}

with open("/kaggle/working/training_history.json", "w", encoding="utf-8") as f:
    json.dump(export, f, indent=2)

print("Saved training_history.json")
print(json.dumps(export, indent=2)[:500], "...")

# --- end Kaggle cell ---
# Download from Kaggle Output:
#   training_history.json
#   training_curves_v3.png
#   confusion_matrix_v3.png
#   augmentation_example.png
#   streaming_simulation.png
#   model.onnx, model_quant.onnx
#
# Then locally:
#   python scripts/import_kaggle_outputs.py "path/to/downloaded/folder"
#   npm run metrics
