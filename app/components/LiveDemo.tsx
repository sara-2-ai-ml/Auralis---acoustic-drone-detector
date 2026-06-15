"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";

const API_URL =
  "https://sararesulaj4-drone-detector-api.hf.space/predict";

type DetectionResult = {
  label: "Drone Detected" | "No Drone";
  confidence: number;
  latencyMs: number;
} | null;

function drawMelSpectrogram(
  canvas: HTMLCanvasElement,
  melData: number[],
  barRgb: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const nMels = 64;
  const nFrames = 32;
  const colW = w / nFrames;
  const rowH = h / nMels;

  const min = Math.min(...melData);
  const max = Math.max(...melData);
  const range = max - min || 1;

  for (let mel = 0; mel < nMels; mel++) {
    for (let frame = 0; frame < nFrames; frame++) {
      const val = melData[mel * nFrames + frame];
      const norm = (val - min) / range;
      const alpha = norm * 0.9 + 0.05;
      ctx.fillStyle = `rgba(${barRgb}, ${alpha})`;
      ctx.fillRect(frame * colW, (nMels - 1 - mel) * rowH, colW, rowH);
    }
  }
}

function drawPlaceholderSpectrogram(
  canvas: HTMLCanvasElement,
  barRgb: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const numCols = 32;
  const numRows = 64;
  const colW = w / numCols;
  const rowH = h / numRows;

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      const freq = row / numRows;
      const time = col / numCols;
      const base = Math.sin(freq * Math.PI * 3 + time * 8) * 0.3 + 0.35;
      const harmonic = Math.sin(freq * Math.PI * 9 + time * 5) * 0.1;
      const noise = (Math.random() - 0.5) * 0.08;
      const val = Math.max(0, Math.min(1, base + harmonic + noise));
      const alpha = val * 0.7;
      ctx.fillStyle = `rgba(${barRgb}, ${alpha})`;
      ctx.fillRect(col * colW, (numRows - 1 - row) * rowH, colW, rowH);
    }
  }
}

export default function LiveDemo() {
  const { theme } = useTheme();
  const barRgb = theme === "light" ? "15, 17, 23" : "232, 230, 225";
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".wav")) {
      setError("Only .wav files are supported.");
      setFileName(null);
      setResult(null);
      return;
    }

    setError(null);
    setResult(null);
    setFileName(file.name);
    setIsProcessing(true);

    const startTime = performance.now();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = (await response.json()) as {
        label: string;
        confidence: number;
        mel_data?: number[];
      };
      const latencyMs = Math.round(performance.now() - startTime);

      if (canvasRef.current && data.mel_data?.length === 2048) {
        drawMelSpectrogram(canvasRef.current, data.mel_data, barRgb);
      } else if (canvasRef.current) {
        drawPlaceholderSpectrogram(canvasRef.current, barRgb);
      }

      const droneProb = data.confidence;
      const displayConfidence =
        data.label === "Drone Detected" ? droneProb : 1 - droneProb;

      setResult({
        label: data.label as "Drone Detected" | "No Drone",
        confidence: displayConfidence,
        latencyMs,
      });
    } catch {
      setError("Failed to process audio file.");
      setFileName(null);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [barRgb]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  return (
    <section
      id="demo"
      className="py-24 px-6"
      aria-label="Live analysis"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.18em] uppercase mb-3 opacity-50"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Analysis
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Upload audio. Get a verdict.
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
          >
            Inference runs on Hugging Face Spaces — librosa preprocessing + ONNX
            model, same pipeline as training.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload WAV file for drone detection"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="rounded-lg flex flex-col items-center justify-center gap-4 py-16 px-8 cursor-pointer transition-all"
              style={{
                background: isDragging
                  ? "var(--tag-bg)"
                  : "var(--bg-surface)",
                border: isDragging
                  ? "1px dashed var(--text-muted)"
                  : "1px dashed var(--border)",
              }}
            >
              <div
                className="p-3 rounded-full"
                style={{ background: "var(--icon-bg)" }}
              >
                <Upload
                  size={22}
                  aria-hidden="true"
                  style={{ color: "var(--text-primary)", opacity: 0.5 }}
                />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}
                >
                  {fileName ?? "Drag & drop a .wav file"}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
                >
                  or click to browse — .wav, max 30 s
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".wav,audio/wav"
              className="sr-only"
              aria-hidden="true"
              onChange={handleChange}
            />

            {error && (
              <div
                className="flex items-center gap-2 text-sm px-4 py-3 rounded"
                style={{
                  background: "var(--tag-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <AlertCircle size={14} aria-hidden="true" />
                {error}
              </div>
            )}

            {(isProcessing || result) && (
              <div
                className="rounded-lg px-6 py-5"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "var(--border-subtle)",
                        borderTopColor: "var(--text-primary)",
                      }}
                      role="status"
                      aria-label="Processing"
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-jetbrains-mono)",
                      }}
                    >
                      Running inference…
                    </span>
                  </div>
                ) : result ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {result.label === "Drone Detected" ? (
                        <XCircle
                          size={20}
                          aria-hidden="true"
                          style={{ color: "var(--text-primary)", opacity: 0.9 }}
                        />
                      ) : (
                        <CheckCircle2
                          size={20}
                          aria-hidden="true"
                          style={{ color: "var(--text-primary)", opacity: 0.5 }}
                        />
                      )}
                      <span
                        className="text-lg font-medium"
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {result.label}
                      </span>
                    </div>

                    <div className="flex gap-6 pt-1">
                      <div>
                        <div
                          className="text-xs uppercase tracking-widest mb-1 opacity-40"
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          Confidence
                        </div>
                        <div
                          className="text-2xl font-medium"
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          {(result.confidence * 100).toFixed(1)}
                          <span
                            className="text-sm ml-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            %
                          </span>
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-xs uppercase tracking-widest mb-1 opacity-40"
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          Latency
                        </div>
                        <div
                          className="text-2xl font-medium"
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          {result.latencyMs}
                          <span
                            className="text-sm ml-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div
            className="rounded-lg overflow-hidden flex flex-col"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span
                className="text-xs uppercase tracking-widest opacity-40"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Mel Spectrogram
              </span>
              <div className="flex gap-1.5">
                {["64 mel bins", "32 frames", "16000 Hz"].map((label) => (
                  <span
                    key={label}
                    className="text-[9px] px-1.5 py-0.5 rounded opacity-40"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      background: "var(--border-subtle)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative flex-1 min-h-[220px]">
              {!fileName && !isProcessing ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p
                    className="text-xs opacity-30"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    awaiting audio input…
                  </p>
                </div>
              ) : null}
              <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="w-full h-full"
                aria-label="Mel spectrogram visualization"
                style={{ display: fileName || isProcessing ? "block" : "none" }}
              />
            </div>

            <div
              className="px-4 py-2 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(107,114,128,0.1)" }}
            >
              <span
                className="text-[9px] opacity-30"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                0 Hz
              </span>
              <span
                className="text-[9px] opacity-30"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                frequency →
              </span>
              <span
                className="text-[9px] opacity-30"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                8000 Hz
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
