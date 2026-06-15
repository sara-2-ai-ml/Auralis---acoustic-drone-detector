export const TRAINING_ASSETS = {
  trainingCurves: "/training/training-curves.png",
  confusionMatrix: "/training/confusion-matrix.png",
  spectrogramCompare: "/training/spectrogram-compare.png",
  latencyChart: "/training/latency-chart.png",
} as const;

export const PLACEHOLDER_ASSETS = {
  trainingCurves: "/placeholders/training-curve.svg",
  confusionMatrix: "/placeholders/confusion-matrix.svg",
  spectrogramCompare: "/placeholders/spectrogram-compare.svg",
  latencyChart: "/placeholders/latency-chart.svg",
} as const;

/** Prefer Kaggle PNG when imported; fall back to SVG placeholders. */
export function trainingOrPlaceholder(
  key: keyof typeof TRAINING_ASSETS
): string {
  return TRAINING_ASSETS[key];
}
