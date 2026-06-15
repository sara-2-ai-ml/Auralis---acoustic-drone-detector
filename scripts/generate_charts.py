import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

BG = "#0d0f14"
FG = "#e8e6e1"
MUTED = "#6b7280"

# === Training Curves (real data, model v3, Phase 4C) ===
train_loss = [0.0453, 0.0269, 0.0221, 0.0196, 0.0162, 0.0148, 0.0135, 0.0118, 0.0108, 0.0105, 0.0103, 0.0095, 0.0097, 0.0088]
val_loss   = [0.0386, 0.0179, 0.0225, 0.0109, 0.0114, 0.0336, 0.0101, 0.0090, 0.0081, 0.0119, 0.0086, 0.0077, 0.0069, 0.0072]
val_f1     = [0.9397, 0.9704, 0.9656, 0.9868, 0.9864, 0.9526, 0.9862, 0.9884, 0.9913, 0.9874, 0.9888, 0.9913, 0.9898, 0.9911]
epochs = list(range(1, len(train_loss) + 1))

fig, axes = plt.subplots(1, 2, figsize=(11, 4), facecolor=BG)
for ax in axes:
    ax.set_facecolor(BG)
    ax.tick_params(colors=MUTED, labelsize=9)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_alpha(0.3)
    ax.grid(True, alpha=0.08, color=MUTED)

axes[0].plot(epochs, train_loss, color=FG, linewidth=2, marker="o", markersize=3, label="Train Loss")
axes[0].plot(epochs, val_loss, color=MUTED, linewidth=2, marker="o", markersize=3, label="Val Loss")
axes[0].set_title("Loss Curves (Final Model)", color=FG, fontsize=11, fontfamily="monospace")
axes[0].set_xlabel("Epoch", color=MUTED, fontsize=9, fontfamily="monospace")
axes[0].legend(facecolor=BG, edgecolor=MUTED, labelcolor=FG, fontsize=8)

axes[1].plot(epochs, val_f1, color=FG, linewidth=2, marker="o", markersize=3)
axes[1].axhline(0.99, color=MUTED, linestyle="--", linewidth=1, alpha=0.6)
axes[1].set_title("Validation F1 Score", color=FG, fontsize=11, fontfamily="monospace")
axes[1].set_xlabel("Epoch", color=MUTED, fontsize=9, fontfamily="monospace")
axes[1].set_ylim(0.92, 1.0)

plt.tight_layout()
plt.savefig("public/training_curves.png", dpi=150, facecolor=BG, bbox_inches="tight")
print("saved training_curves.png")

# === Confusion Matrix (reconstructed from reported precision/recall, Cell 48) ===
# No-Drone: P=0.99 R=0.99 support=18899 | Drone: P=0.99 R=0.99 support=26428
cm = np.array([[18710, 189], [264, 26164]])

fig, ax = plt.subplots(figsize=(5, 4.5), facecolor=BG)
ax.set_facecolor(BG)
ax.imshow(cm, cmap="Greys")
labels = ["No-Drone", "Drone"]
ax.set_xticks([0, 1])
ax.set_yticks([0, 1])
ax.set_xticklabels(labels, color=FG, fontfamily="monospace")
ax.set_yticklabels(labels, color=FG, fontfamily="monospace")
ax.set_xlabel("Predicted", color=MUTED, fontfamily="monospace")
ax.set_ylabel("Actual", color=MUTED, fontfamily="monospace")
ax.set_title("Confusion Matrix (n=45,327)", color=FG, fontsize=11, fontfamily="monospace")
for spine in ax.spines.values():
    spine.set_visible(False)
for i in range(2):
    for j in range(2):
        val = cm[i, j]
        text_color = BG if val / cm.max() > 0.5 else FG
        ax.text(
            j,
            i,
            f"{val:,}",
            ha="center",
            va="center",
            color=text_color,
            fontsize=14,
            fontfamily="monospace",
            fontweight="bold",
        )

plt.tight_layout()
plt.savefig("public/confusion_matrix.png", dpi=150, facecolor=BG, bbox_inches="tight")
print("saved confusion_matrix.png")

# === Streaming Simulation (real data, 5s no-drone audio) ===
window_idx = list(range(9))
confidences = [0.007, 0.005, 0.152, 0.277, 0.431, 0.018, 0.006, 0.041, 0.435]
latencies = [14.0, 13.5, 14.2, 13.8, 16.223, 13.9, 14.1, 13.7, 14.0]

smooth_window = 3
smoothed = np.convolve(confidences, np.ones(smooth_window) / smooth_window, mode="valid")

fig, axes = plt.subplots(2, 1, figsize=(10, 6), facecolor=BG)
for ax in axes:
    ax.set_facecolor(BG)
    ax.tick_params(colors=MUTED, labelsize=9)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_alpha(0.3)
    ax.grid(True, alpha=0.08, color=MUTED)

axes[0].plot(window_idx, confidences, marker="o", color=MUTED, label="Raw confidence", markersize=4)
axes[0].plot(range(len(smoothed)), smoothed, marker="s", color=FG, label="Smoothed", markersize=4)
axes[0].axhline(0.5, color=MUTED, linestyle="--", linewidth=1, alpha=0.6, label="Threshold")
axes[0].set_title(
    "Drone Detection Confidence Over Time (5s no-drone audio)",
    color=FG,
    fontsize=11,
    fontfamily="monospace",
)
axes[0].set_xlabel("Window index", color=MUTED, fontsize=9, fontfamily="monospace")
axes[0].set_ylabel("P(drone)", color=MUTED, fontsize=9, fontfamily="monospace")
axes[0].legend(facecolor=BG, edgecolor=MUTED, labelcolor=FG, fontsize=8)

axes[1].plot(window_idx, latencies, marker="o", color=FG, markersize=4)
axes[1].set_title("Per-Window Inference Latency", color=FG, fontsize=11, fontfamily="monospace")
axes[1].set_xlabel("Window index", color=MUTED, fontsize=9, fontfamily="monospace")
axes[1].set_ylabel("Latency (ms)", color=MUTED, fontsize=9, fontfamily="monospace")

plt.tight_layout()
plt.savefig("public/streaming_simulation.png", dpi=150, facecolor=BG, bbox_inches="tight")
print("saved streaming_simulation.png")

# === Augmentation Comparison ===
import librosa
import random

SR = 16000
N_FFT = 512
HOP = 256
N_MELS = 64
EPS = 1e-10

audio, sr = librosa.load("public/test_drone.wav", sr=SR)
mel = librosa.feature.melspectrogram(
    y=audio,
    sr=SR,
    n_fft=N_FFT,
    hop_length=HOP,
    n_mels=N_MELS,
    win_length=N_FFT,
    center=False,
)
mel_db = librosa.power_to_db(mel, ref=1.0, amin=EPS)

if mel_db.shape[1] > 32:
    mel_db = mel_db[:, :32]
elif mel_db.shape[1] < 32:
    mel_db = np.pad(mel_db, ((0, 0), (0, 32 - mel_db.shape[1])))


def spec_augment(mel_spec, time_mask_param=8, freq_mask_param=8, num_masks=2):
    mel_aug = mel_spec.copy()
    n_mels, n_frames = mel_aug.shape
    for _ in range(num_masks):
        t = random.randint(0, max(1, time_mask_param))
        t0 = random.randint(0, max(1, n_frames - t))
        mel_aug[:, t0 : t0 + t] = mel_aug.min()
        f = random.randint(0, max(1, freq_mask_param))
        f0 = random.randint(0, max(1, n_mels - f))
        mel_aug[f0 : f0 + f, :] = mel_aug.min()
    return mel_aug


random.seed(42)
mel_aug = spec_augment(mel_db)

fig, axes = plt.subplots(1, 2, figsize=(10, 4), facecolor=BG)
for ax, data, title in zip(
    axes,
    [mel_db, mel_aug],
    ["Original Mel-Spectrogram", "SpecAugment Applied"],
):
    ax.set_facecolor(BG)
    ax.imshow(data, aspect="auto", origin="lower", cmap="viridis")
    ax.set_title(title, color=FG, fontsize=11, fontfamily="monospace")
    ax.tick_params(colors=MUTED, labelsize=8)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_alpha(0.3)

plt.tight_layout()
plt.savefig("public/augmentation_example.png", dpi=150, facecolor=BG, bbox_inches="tight")
print("saved augmentation_example.png")
