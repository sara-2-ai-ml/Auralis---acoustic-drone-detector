import { ExternalLink, GitBranch } from "lucide-react";
import AuralisLogo from "@/app/components/AuralisLogo";
import { BRAND } from "@/app/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-12 px-6"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface-alt)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <AuralisLogo size={32} className="shrink-0" />
            <div className="flex flex-col leading-tight">
              <span
                className="font-semibold text-sm tracking-wide"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  color: "var(--text-primary)",
                }}
              >
                {BRAND.name}
              </span>
              <span
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
              >
                {BRAND.tagline} · {year}
              </span>
            </div>
          </div>

          {/* Footer nav */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {BRAND.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[10px] uppercase tracking-widest transition-opacity hover:opacity-100 focus-visible:opacity-100"
                style={{
                  color: "var(--text-nav)",
                  fontFamily: "var(--font-jetbrains-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Links */}
          <div className="flex items-center gap-3">
            <a
              href={BRAND.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity hover:opacity-80 focus-visible:opacity-80"
              style={{
                background: "var(--icon-bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.12em",
              }}
            >
              <GitBranch size={12} aria-hidden="true" />
              {BRAND.githubLabel}
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity hover:opacity-80 focus-visible:opacity-80"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-nav)",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.12em",
              }}
            >
              <ExternalLink size={12} aria-hidden="true" />
              LinkedIn
            </a>
          </div>
        </div>

        <p
          className="text-[10px] text-center lg:text-left opacity-30"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Acoustic threat detection · edge-deployable ONNX pipeline
        </p>
      </div>
    </footer>
  );
}
