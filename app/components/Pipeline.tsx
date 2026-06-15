"use client";

import { useCallback, useEffect, useState } from "react";
import { Mic, BarChart2, BrainCircuit, FileOutput, Cpu, X } from "lucide-react";
import ChartPlaceholder from "@/app/components/ChartPlaceholder";

interface PipelineStep {
  icon: React.ElementType;
  title: string;
  sub: string;
  detail: string;
  showArchitectureLink?: boolean;
}

const steps: PipelineStep[] = [
  {
    icon: Mic,
    title: "Audio Input",
    sub: "16 kHz mono PCM",
    detail: "Microphone or file stream, resampled and normalized to [-1, 1]",
  },
  {
    icon: BarChart2,
    title: "Mel-Spectrogram",
    sub: "n_mels=64, hop=160",
    detail: "Log-power mel filterbank, Hann window 1024, dB scaling",
  },
  {
    icon: BrainCircuit,
    title: "CNN Model",
    sub: "EfficientNet-B0 variant",
    detail: "Lightweight backbone, global average pool, sigmoid head",
    showArchitectureLink: true,
  },
  {
    icon: FileOutput,
    title: "ONNX Export",
    sub: "opset 17, dynamic axes",
    detail: "torch.onnx.export → onnxsim → validate with ort.InferenceSession",
  },
  {
    icon: Cpu,
    title: "Edge Deploy",
    sub: "RPi 4 / Jetson Orin NX",
    detail: "TensorRT FP16, OpenVINO IR, or ONNX Runtime w/ XNNPACK delegate",
  },
];

export default function Pipeline() {
  const [architectureOpen, setArchitectureOpen] = useState(false);

  const closeModal = useCallback(() => setArchitectureOpen(false), []);

  useEffect(() => {
    if (!architectureOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [architectureOpen, closeModal]);

  return (
    <>
      <section
        className="py-24 px-6"
        style={{ background: "var(--bg-surface-alt)" }}
        id="pipeline"
        aria-label="System pipeline"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p
              className="text-xs tracking-[0.18em] uppercase mb-3 opacity-50"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              Architecture
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              From audio to answer.
            </h2>
          </div>

          <div className="overflow-x-auto pb-4 -mx-2 px-2">
            <div className="flex items-start gap-0 min-w-max md:min-w-0">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-start">
                    <div
                      className="w-52 md:w-auto md:flex-1 flex flex-col gap-3 p-5 rounded-lg"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        minWidth: "180px",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] opacity-30"
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div
                          className="p-1.5 rounded"
                          style={{ background: "var(--icon-bg)" }}
                        >
                          <Icon
                            size={14}
                            aria-hidden="true"
                            style={{ color: "var(--text-primary)", opacity: 0.6 }}
                          />
                        </div>
                      </div>

                      <div>
                        <h3
                          className="text-sm font-semibold mb-0.5"
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-[10px] mb-2"
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {step.sub}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-inter)",
                            opacity: 0.8,
                          }}
                        >
                          {step.detail}
                        </p>

                        {step.showArchitectureLink && (
                          <button
                            type="button"
                            onClick={() => setArchitectureOpen(true)}
                            className="mt-3 text-[10px] underline underline-offset-2 transition-opacity hover:opacity-60 focus-visible:opacity-60 cursor-pointer"
                            style={{
                              fontFamily: "var(--font-jetbrains-mono)",
                              color: "var(--text-primary)",
                              opacity: 0.7,
                            }}
                          >
                            View architecture diagram
                          </button>
                        )}
                      </div>
                    </div>

                    {i < steps.length - 1 && (
                      <div
                        className="flex items-center self-center px-2 shrink-0"
                        aria-hidden="true"
                      >
                        <svg
                          width="28"
                          height="16"
                          viewBox="0 0 28 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <line
                            x1="0"
                            y1="8"
                            x2="20"
                            y2="8"
                            stroke="rgba(107,114,128,0.4)"
                            strokeWidth="1"
                          />
                          <polyline
                            points="14,3 20,8 14,13"
                            fill="none"
                            stroke="rgba(107,114,128,0.4)"
                            strokeWidth="1"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p
            className="text-xs mt-6 opacity-30 md:hidden"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            ← scroll to see full pipeline →
          </p>
        </div>
      </section>

      {architectureOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="architecture-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-pointer"
            style={{ background: "var(--overlay-bg)" }}
            aria-label="Close architecture diagram"
            onClick={closeModal}
          />

          <div
            className="relative z-10 w-full max-w-md rounded-lg p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3
                id="architecture-modal-title"
                className="text-sm font-semibold"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  color: "var(--text-primary)",
                }}
              >
                CNN Architecture
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded transition-opacity hover:opacity-60 focus-visible:opacity-60 cursor-pointer"
                aria-label="Close"
              >
                <X size={16} aria-hidden="true" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <ChartPlaceholder
              src="/placeholders/architecture-diagram.svg"
              alt="CNN architecture diagram placeholder"
              width={400}
              height={300}
              label="architecture diagram"
              className="mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
