"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/app/lib/brand";
import { useTheme } from "@/app/components/ThemeProvider";
import { ArrowDown } from "lucide-react";

const HERO_VIDEO_SRC = "/hero-bg.mp4";
const HERO_SPECTROGRAM_SRC = "/placeholders/hero-spectrogram.svg";
const START_TIME = 15;
const END_TIME = 20;

async function safePlay(video: HTMLVideoElement): Promise<boolean> {
  try {
    await video.play();
    return true;
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "AbortError" || err.name === "NotAllowedError")
    ) {
      return false;
    }
    return false;
  }
}

export default function Hero() {
  const { theme } = useTheme();
  const barRgb = theme === "light" ? "15, 17, 23" : "232, 230, 225";
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [useBackgroundFallback, setUseBackgroundFallback] = useState(false);
  const [useWaveformFallback, setUseWaveformFallback] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const showVideo =
    !useBackgroundFallback && !prefersReducedMotion && !useWaveformFallback;

  useEffect(() => {
    if (!showVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const handleLoadedMetadata = () => {
      video.currentTime = START_TIME;
      void safePlay(video).then((ok) => {
        if (!cancelled && !ok) setUseBackgroundFallback(true);
      });
    };

    const handleTimeUpdate = () => {
      if (video.currentTime >= END_TIME) {
        video.currentTime = START_TIME;
      }
    };

    const handleSeeked = () => {
      if (video.paused) {
        void safePlay(video);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && video.paused) {
        void safePlay(video);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);
    document.addEventListener("visibilitychange", handleVisibility);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [showVideo]);

  useEffect(() => {
    if (showVideo || !useWaveformFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      drawStatic(ctx, canvas.offsetWidth, canvas.offsetHeight);
      return () => window.removeEventListener("resize", resize);
    }

    let t = 0;
    const numBands = 48;

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const bandWidth = w / numBands;

      for (let i = 0; i < numBands; i++) {
        const freq = (i / numBands) * Math.PI * 4;
        const base = Math.sin(freq + t * 0.4) * 0.4 + 0.5;
        const detail = Math.sin(freq * 2.3 + t * 0.9) * 0.15;
        const noise = Math.sin(freq * 5.7 + t * 1.6) * 0.07;
        const intensity = Math.max(0.02, Math.min(0.9, base + detail + noise));

        const x = i * bandWidth;
        const barH = intensity * h * 0.6;
        const y = h - barH;

        const alpha = intensity * 0.18;
        ctx.fillStyle = `rgba(${barRgb}, ${alpha})`;
        ctx.fillRect(x, y, bandWidth - 1, barH);
      }

      t += 0.012;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion, showVideo, useWaveformFallback, barRgb]);

  const drawStatic = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    const numBands = 48;
    const bandWidth = w / numBands;
    for (let i = 0; i < numBands; i++) {
      const freq = (i / numBands) * Math.PI * 4;
      const intensity = Math.max(0.04, Math.abs(Math.sin(freq)) * 0.5);
      ctx.fillStyle = `rgba(${barRgb}, ${intensity * 0.15})`;
      ctx.fillRect(
        i * bandWidth,
        h - intensity * h * 0.5,
        bandWidth - 1,
        intensity * h * 0.5
      );
    }
  };

  const handleDemoScroll = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-start justify-center overflow-hidden pt-16 px-6 md:px-12 lg:px-20"
      aria-label="Hero"
    >
      {showVideo ? (
        <>
          <video
            ref={videoRef}
            muted
            loop={false}
            playsInline
            preload="metadata"
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              zIndex: 0,
              opacity: 0.35,
              filter: "grayscale(1)",
              transform: "translateX(15%)",
            }}
            onError={() => setUseBackgroundFallback(true)}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{ background: "var(--hero-overlay)" }}
            aria-hidden="true"
          />
        </>
      ) : useWaveformFallback ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
          aria-hidden="true"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HERO_SPECTROGRAM_SRC}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none object-cover grayscale"
          style={{ zIndex: 0, opacity: 0.15 }}
          onError={() => setUseWaveformFallback(true)}
        />
      )}

      <div className="relative z-10 w-full max-w-2xl text-left">
        <p
          className="text-sm tracking-[0.2em] uppercase mb-6 opacity-50"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {BRAND.eyebrow}
        </p>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.08] mb-6"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Acoustic Threat{" "}
          <em className="not-italic" style={{ fontStyle: "italic" }}>
            Detection,
          </em>
          <br />
          Simplified.
        </h1>

        <p
          className="text-base md:text-lg mb-10 leading-relaxed max-w-lg"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
        >
          Raw audio in. Drone presence out. Mel-spectrogram CNN pipeline,
          exported for edge deployment.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-3">
          <button
            onClick={handleDemoScroll}
            className="px-7 py-3.5 text-base font-medium rounded transition-opacity hover:opacity-80 focus-visible:opacity-80 cursor-pointer"
            style={{
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Run Live Analysis
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 z-10">
        <ArrowDown size={16} aria-hidden="true" />
      </div>
    </section>
  );
}
