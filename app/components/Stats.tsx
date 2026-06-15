"use client";

import { useEffect, useRef, useState } from "react";
import {
  accuracyToSparkline,
  DISPLAY_STATS,
  metricsToCards,
  type MetricsPayload,
  type StatCard,
} from "@/app/lib/metrics";

const FALLBACK: StatCard[] = DISPLAY_STATS;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useInView(threshold = 0.35) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AnimatedValue({
  value,
  decimals = 0,
  unit = "",
  active,
}: {
  value: number;
  decimals?: number;
  unit?: string;
  active: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;

    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(value * easeOutCubic(progress));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [active, value]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <>
      {formatted}
      {unit && (
        <span
          className="text-2xl md:text-3xl ml-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {unit}
        </span>
      )}
    </>
  );
}

function TrainingSparkline({
  active,
  points,
}: {
  active: boolean;
  points: string;
}) {
  const pathRef = useRef<SVGPolylineElement>(null);
  const [length, setLength] = useState(0);
  const end = points.trim().split(" ").pop()?.split(",") ?? ["148", "8"];

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, [points]);

  return (
    <figure className="mt-4 flex flex-col gap-1.5">
      <svg
        viewBox="0 0 152 48"
        width={152}
        height={48}
        aria-hidden="true"
        className="block rounded"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}
      >
        {[12, 24, 36].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="152"
            y2={y}
            stroke="var(--text-muted)"
            strokeOpacity="0.12"
            strokeWidth="0.5"
          />
        ))}
        <polyline
          ref={pathRef}
          points={points}
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.55"
          style={{
            strokeDasharray: length,
            strokeDashoffset: active ? 0 : length,
            transition: active ? "stroke-dashoffset 1.4s ease-out" : "none",
          }}
        />
        <circle
          cx={end[0]}
          cy={end[1]}
          r="2"
          fill="var(--text-primary)"
          opacity={active ? 0.7 : 0}
          style={{ transition: "opacity 0.4s ease 1.2s" }}
        />
      </svg>
      <figcaption
        className="text-[9px] uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          color: "var(--text-muted)",
        }}
      >
        validation accuracy
      </figcaption>
    </figure>
  );
}

export default function Stats() {
  const { ref, visible } = useInView();
  const [cards, setCards] = useState<StatCard[]>(FALLBACK);
  const [sparklinePoints, setSparklinePoints] = useState<string | null>(null);

  useEffect(() => {
    fetch("/metrics.json")
      .then((r) => r.json())
      .then((data: MetricsPayload) => {
        setCards(metricsToCards(data));
        if (data.validation_accuracy?.length) {
          setSparklinePoints(
            accuracyToSparkline(data.validation_accuracy)
          );
        }
      })
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  return (
    <section
      ref={ref}
      className="border-y"
      style={{ borderColor: "var(--border)" }}
      aria-label="Key metrics"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {cards.map((stat, i) => (
            <div
              key={stat.label}
              className="py-10 px-6 flex flex-col gap-1 transition-all duration-700"
              style={{
                borderRight:
                  i < cards.length - 1
                    ? "1px solid var(--border)"
                    : undefined,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transitionDelay: visible ? `${i * 80}ms` : "0ms",
              }}
            >
              <div
                className="text-4xl md:text-5xl font-medium tracking-tight leading-none mb-1 tabular-nums"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: "var(--text-primary)",
                }}
              >
                <AnimatedValue
                  value={stat.value}
                  decimals={stat.decimals}
                  unit={stat.unit}
                  active={visible}
                />
              </div>
              <div
                className="text-xs font-medium tracking-widest uppercase"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: "var(--text-primary)",
                  opacity: 0.8,
                }}
              >
                {stat.label}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
              >
                {stat.detail}
              </div>

              {stat.label === "F1 Score" && sparklinePoints && (
                <TrainingSparkline active={visible} points={sparklinePoints} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
