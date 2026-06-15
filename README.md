# 🎧  Auralis - Acoustic Drone Detection System

**Real-time UAV detection from audio using a lightweight CNN, optimized for edge deployment.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-e8e6e1?style=flat-square)](https://auralis-acoustic-drone-detector.vercel.app/)
[![Model](https://img.shields.io/badge/Model-ONNX-6b7280?style=flat-square)](#model--export)
[![License](https://img.shields.io/badge/License-MIT-6b7280?style=flat-square)](#license)

> Upload a `.wav` file and get an instant verdict — **Drone Detected** or **No Drone** — powered by a CNN trained on mel-spectrograms and served via ONNX Runtime.

**[🔗 Live Demo](https://your-project.vercel.app)** · **[📓 Training Notebook](https://colab.research.google.com/drive/1dM79uk5dGjJ1AkuiCp9zERwZoKVIqSZc)** · **[🤗 Inference API](https://huggingface.co/spaces/sararesulaj4/drone-detector-api)**

---

## Screenshots

![Hero](docs/screenshots/1.png)

| Live Analysis | Capabilities & Results |
|---|---|
| ![Live Demo](docs/screenshots/2.png) | ![Capabilities](docs/screenshots/3.png) |

| Architecture Pipeline | Edge Optimization & Streaming |
|---|---|
| ![Architecture](docs/screenshots/4.png) | ![Edge Pipeline](docs/screenshots/5.png) |

![Deployment Stack](docs/screenshots/6.png)

!(docs/screenshots/7.png)

## Overview

This project is an end-to-end acoustic drone detection pipeline: from raw audio to a deployable, edge-optimized model with a working web demo. It was built to demonstrate practical skills in **audio ML, signal processing, model optimization, and full-stack deployment** — not just a notebook that stops at `model.fit()`.

The system listens to a 1-second audio clip and classifies it as containing a drone (based on propeller acoustic signatures) or not, using a **64×32 mel-spectrogram** fed into a lightweight CNN, exported to **ONNX** for fast, hardware-agnostic inference.

---

## Results

| Metric | Value | Notes |
|---|---|---|
| **F1 Score** | 0.99 | Macro avg, held-out test set (45,327 chunks) |
| **ROC-AUC** | 0.9996 | |
| **Inference Latency** | 0.12 ms | ONNX Runtime (fp32), CPU |
| **Model Size** | 1.1 MB (fp32) / 288 KB (INT8) | |
| **Training Data** | 305,006 mel-spectrogram chunks | from 180,320 source clips ([DADS dataset](https://huggingface.co/datasets/geronimobasso/drone-audio-detection-samples)) |
| **Throughput** | ~850–1,100 chunks/sec | far exceeds the 1 chunk/sec real-time requirement |

> **On methodology:** 99% F1 is consistent with published results for binary drone/no-drone CNN classifiers (96–99% in literature). This reflects strong performance *on the DADS benchmark distribution* — see [Limitations](#limitations--future-work) for what this number does and doesn't mean.

---

## How It Works

```
Raw Audio (16kHz, mono)
    → Spectral Gating (noise suppression)
    → Mel-Spectrogram (64 mel bins × 32 frames)
    → CNN (3× Conv-BN-ReLU-Pool blocks)
    → ONNX Export + INT8 Quantization
    → Sliding-window streaming inference
```

1. **Audio chunking** — variable-length clips (0.3s–209s) are split into fixed 1-second windows.
2. **Noise reduction** — spectral gating removes low-energy frequency bins below a dB threshold.
3. **Feature extraction** — each chunk becomes a 64×32 log-mel spectrogram (the model's "image" of the sound).
4. **Classification** — a 3-block CNN (~280K params) classifies drone vs. no-drone.
5. **Export & optimization** — the trained model is exported to ONNX (and INT8-quantized) for fast, portable inference.
6. **Streaming simulation** — a sliding-window pipeline (1s window, 0.5s hop) with confidence smoothing demonstrates live-microphone feasibility.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│  FastAPI on  │────▶│   librosa    │────▶│ ONNX Runtime │
│  (Next.js,   │ wav │ HF Spaces    │     │ preprocessing│     │  inference   │
│   Vercel)    │◀────│  (Docker)    │◀────│ (mel-spec)   │◀────│  (model3)    │
└─────────────┘ json └──────────────┘     └─────────────┘     └──────────────┘
```

The frontend is a static Next.js app (deployed on Vercel) that sends uploaded audio to a FastAPI backend (Hugging Face Spaces, Docker) for preprocessing and inference — ensuring **train/inference parity** by reusing the exact `librosa` pipeline used during training.

---

## Key Engineering Decisions & Investigations

This project's value isn't just "I trained a model" — it's the investigation that followed.

### 🔍 Investigation 1 — Is 99.5% F1 too good to be true?
The first training run hit F1 = 0.9949. Two potential confounds were investigated:

- **Data leakage**: the original train/val/test split was done at the *chunk* level, but each clip produces multiple chunks. Fixed with **`GroupShuffleSplit`** (clip-level grouping). Result: F1 = 0.9953 — *no drop*, confirming the model wasn't memorizing.
- **Padding artifact**: 99.1% of drone clips are <1s, meaning they were ~50% zero-padded after chunking — a potential "padding = drone" shortcut. Fixed with **tile-padding** (repeating the signal instead of zero-padding, which is acoustically realistic for continuous propeller rotation). Result: F1 = 0.9922 — again, *no meaningful drop*.

**Conclusion**: the model learns genuine acoustic features (sustained low-frequency energy + harmonic structure), not split or padding shortcuts.

### ⚙️ Why CNN over RNN/Transformer?
Mel-spectrograms are inherently 2D (frequency × time). CNNs preserve this spatial structure directly; RNNs would flatten the frequency axis, and Transformers (e.g. AST) are overkill — and too slow — for a 64×32 binary classification task on edge hardware.

### ⚡ Why ONNX fp32 over INT8 quantization?
INT8 quantization is usually faster — but on this small model (1.1MB) running on x86 CPU, the quantize/dequantize overhead made it **slower** (1.176ms vs 0.124ms for fp32). Both are far below the 1000ms real-time budget, but fp32 ONNX is the better default here. INT8 (288KB) remains valuable for memory-constrained ARM deployments (Raspberry Pi/Jetson), pending re-benchmarking on actual hardware.

### 🎯 Why Focal Loss + class weights?
The raw dataset has a 9.78:1 class imbalance (drone-dominant). Focal loss (γ=2) down-weights easy examples and focuses training on the decision boundary, combined with inverse-frequency class weights.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Model & Training** | PyTorch, torchvision, Focal Loss, mixed precision |
| **Audio Processing** | librosa, soundfile, NumPy, SciPy, spectral gating |
| **Model Export** | ONNX, ONNX Runtime, INT8 dynamic quantization |
| **Inference API** | FastAPI, Docker, Hugging Face Spaces |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **Deployment** | Vercel (frontend) + Hugging Face Spaces (inference API) |
| **Dataset** | [DADS](https://huggingface.co/datasets/geronimobasso/drone-audio-detection-samples) (180K+ samples), ESC-50 |

---

## Project Structure

```
.
├── drone-detector-web/        # Next.js frontend (Vercel)
│   ├── app/
│   │   ├── components/        # Hero, Stats, Capabilities, LiveDemo, Pipeline, Footer
│   │   └── lib/
│   ├── public/                # charts, sample audio, generated assets
│   └── scripts/
│       └── generate_charts.py # regenerates result charts from training data
│
├── drone-detector-api/        # FastAPI inference backend (HF Spaces, Docker)
│   ├── app.py                 # /predict endpoint — librosa preprocessing + ONNX inference
│   ├── model.onnx
│   ├── Dockerfile
│   └── requirements.txt
│
└── notebook/
    └── acoustic-drone-detection-system.ipynb   # full training pipeline & analysis
```

---

## Running Locally

**Frontend:**
```bash
cd drone-detector-web
npm install
npm run dev
```

**Inference API:**
```bash
cd drone-detector-api
pip install -r requirements.txt
uvicorn app:app --reload --port 7860
```

The frontend expects the API at the URL configured in `LiveDemo.tsx` — point it to `http://localhost:7860` for local development.

---

## Limitations & Future Work

- **Dataset homogeneity**: DADS represents a limited set of drone models, microphones, and recording conditions. 99% F1 reflects in-distribution performance — real-world generalization to unseen drones/environments is not yet validated.
- **Indoor-dominant recordings**: real outdoor deployment introduces wind, traffic, and reflections not well-represented in training data.
- **Simulated edge benchmarks**: latency was measured on x86 (Kaggle), not on actual Raspberry Pi/Jetson hardware — ARM results may differ, especially for INT8.
- **Binary classification only**: detects presence/absence, not drone type, distance, or direction.

**Planned improvements**: out-of-distribution validation on real field recordings, physical edge deployment benchmarking, multi-microphone direction-of-arrival estimation, and sensor fusion with RF/video.

---

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Built with PyTorch, ONNX, librosa, Next.js, and FastAPI · 2026
</p>
