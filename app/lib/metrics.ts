export interface MetricsPayload {
  generated_at: string;
  platform: {
    system: string;
    machine: string;
    processor: string;
    provider: string;
  };
  f1_score: {
    value: number | null;
    source: string | null;
    detail: string;
  };
  validation_accuracy: number[] | null;
  latency_ms: {
    value: number;
    detail: string;
    breakdown?: {
      inference_ms: { mean: number; p50: number; p95: number };
      pipeline_ms: { mean: number; p50: number; p95: number };
    };
  };
  model_size_mb: {
    value: number | null;
    fp32_mb: number | null;
    quant_mb: number | null;
    detail: string;
    compression_ratio: number | null;
  };
  training_data?: {
    value: number;
    unit?: string;
    detail: string;
  };
  /** @deprecated use training_data */
  training_audio_hours?: {
    value: number | null;
    detail: string;
  };
  evaluation: {
    samples: number;
    accuracy: number;
    f1_macro: number;
  } | null;
}

export interface StatCard {
  value: number;
  decimals?: number;
  unit?: string;
  label: string;
  detail: string;
  sparkline?: boolean;
  source?: string | null;
}

export const DISPLAY_STATS: StatCard[] = [
  {
    value: 0.99,
    decimals: 2,
    label: "F1 Score",
    detail: "macro avg, held-out test set (45,327 chunks)",
    sparkline: true,
  },
  {
    value: 0.12,
    decimals: 2,
    unit: "ms",
    label: "Inference Latency",
    detail: "ONNX Runtime fp32, CPU (model.onnx)",
  },
  {
    value: 1.1,
    decimals: 1,
    unit: "MB",
    label: "Model Size",
    detail: "model.onnx (fp32) — quantized 288KB available",
  },
  {
    value: 305,
    unit: "K",
    label: "Training Data",
    detail: "mel-spectrogram chunks, 180K source clips (DADS)",
  },
];

export function metricsToCards(data: MetricsPayload): StatCard[] {
  const valCurve = data.validation_accuracy;
  const hasSparkline = Boolean(valCurve && valCurve.length >= 2);

  const training =
    data.training_data ??
    (data.training_audio_hours?.value
      ? {
          value: data.training_audio_hours.value,
          unit: "h",
          detail: data.training_audio_hours.detail,
        }
      : null);

  const cards: StatCard[] = [
    {
      value: data.f1_score.value ?? DISPLAY_STATS[0].value,
      decimals: 2,
      label: "F1 Score",
      detail: data.f1_score.detail,
      sparkline: hasSparkline,
      source: data.f1_score.source,
    },
    {
      value: data.latency_ms.value,
      decimals: 2,
      unit: "ms",
      label: "Inference Latency",
      detail: data.latency_ms.detail,
      source: "benchmark_metrics.py",
    },
    {
      value: data.model_size_mb.value ?? DISPLAY_STATS[2].value,
      decimals: 1,
      unit: "MB",
      label: "Model Size",
      detail: data.model_size_mb.detail,
      source: "measured on disk",
    },
    {
      value: training?.value ?? DISPLAY_STATS[3].value,
      unit: training?.unit ?? "K",
      label: training?.unit === "h" ? "Training Audio" : "Training Data",
      detail: training?.detail ?? DISPLAY_STATS[3].detail,
      source: training ? "training dataset" : null,
    },
  ];

  return cards;
}

export function accuracyToSparkline(
  values: number[],
  width = 152,
  height = 48,
  padding = 4
): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * innerW;
      const y = padding + innerH - ((v - min) / span) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
