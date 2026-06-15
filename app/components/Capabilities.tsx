import {
  Waves,
  BrainCircuit,
  Cpu,
  Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  image?: { src: string; alt: string };
}

const capabilities: Capability[] = [
  {
    icon: Waves,
    title: "Audio Signal Processing",
    description:
      "Log-mel spectrogram extraction with configurable hop length, window size, and frequency bins. MFCC features, harmonic-percussive separation, and noise floor reduction via spectral gating.",
    tags: ["mel-spectrogram", "MFCC", "librosa", "spectral gating"],
    image: {
      src: "/augmentation_example.png",
      alt: "Mel-spectrogram augmentation example",
    },
  },
  {
    icon: BrainCircuit,
    title: "CNN Classification",
    description:
      "Lightweight EfficientNet-style backbone trained end-to-end on spectrogram patches. Focal loss with γ=2 handles class imbalance between drone and ambient-only segments.",
    tags: ["PyTorch", "EfficientNet", "focal loss", "data augmentation"],
    image: {
      src: "/confusion_matrix.png",
      alt: "Confusion matrix",
    },
  },
  {
    icon: Cpu,
    title: "Edge Optimization",
    description:
      "Full export pipeline to ONNX, TensorRT FP16/INT8, and OpenVINO IR. Post-training quantization with calibration datasets reduces model size by 4× with <1% F1 degradation.",
    tags: ["ONNX Runtime", "TensorRT", "OpenVINO", "INT8 quant"],
    image: {
      src: "/training_curves.png",
      alt: "Training curves",
    },
  },
  {
    icon: Radio,
    title: "Real-Time Pipeline",
    description:
      "Streaming inference with a sliding window buffer, Python multiprocessing for I/O and compute isolation, and sub-30ms end-to-end latency on Jetson Orin NX.",
    tags: ["streaming", "multiprocessing", "sliding window", "low-latency"],
    image: {
      src: "/streaming_simulation.png",
      alt: "Streaming inference simulation",
    },
  },
];

export default function Capabilities() {
  return (
    <section className="py-24 px-6" id="capabilities" aria-label="Platform">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.18em] uppercase mb-3 opacity-50"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Platform
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            End-to-end detection capability.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-lg p-6 flex flex-col gap-4 transition-opacity hover:opacity-90"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 mt-0.5 p-2 rounded"
                    style={{
                      background: "var(--icon-bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Icon
                      size={18}
                      aria-hidden="true"
                      style={{ color: "var(--text-primary)", opacity: 0.7 }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{
                        fontFamily: "var(--font-space-grotesk)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {cap.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
                    >
                      {cap.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {cap.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] tracking-wide"
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        background: "var(--tag-bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {cap.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cap.image.src}
                    alt={cap.image.alt}
                    className="rounded w-full mt-3"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
