interface ChartPlaceholderProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
  className?: string;
}

export default function ChartPlaceholder({
  src,
  alt,
  width,
  height,
  label,
  className = "",
}: ChartPlaceholderProps) {
  return (
    <figure className={`flex flex-col gap-1.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="block object-cover rounded"
        style={{
          width,
          height,
          border: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      />
      {label && (
        <figcaption
          className="text-[9px] uppercase tracking-widest opacity-40"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}
