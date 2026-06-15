"use client";

interface ResultImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
  className?: string;
}

export default function ResultImage({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  label,
  className = "",
}: ResultImageProps) {
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
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallbackApplied) return;
          img.dataset.fallbackApplied = "1";
          img.src = fallbackSrc;
        }}
      />
      {label && (
        <figcaption
          className="text-[9px] uppercase tracking-widest opacity-50"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}
