const categories = [
  {
    label: "Model & Training",
    items: [
      "PyTorch",
      "torchvision",
      "focal loss",
      "mixed precision",
      "ONNX",
    ],
  },
  {
    label: "Audio",
    items: ["librosa", "soundfile", "numpy", "scipy", "spectral gating"],
  },
  {
    label: "Inference & Edge",
    items: [
      "ONNX Runtime",
      "TensorRT",
      "OpenVINO",
      "XNNPACK",
      "Raspberry Pi 4",
      "Jetson Orin NX",
    ],
  },
  {
    label: "Web / Analysis",
    items: [
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "Hugging Face Spaces",
      "Vercel",
    ],
  },
];

export default function TechStack() {
  return (
    <section className="py-24 px-6" id="stack" aria-label="Deployment">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.18em] uppercase mb-3 opacity-50"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            Deployment
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Edge-ready stack.
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {categories.map((cat) => (
            <div key={cat.label} className="flex flex-col gap-3">
              <span
                className="text-xs uppercase tracking-widest opacity-40"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {cat.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded text-xs"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      opacity: 0.8,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
