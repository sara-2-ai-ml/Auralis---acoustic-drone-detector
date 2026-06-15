"use client";

import AuralisBrand from "@/app/components/AuralisBrand";
import ThemeToggle from "@/app/components/ThemeToggle";
import { BRAND } from "@/app/lib/brand";

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg border-b transition-colors duration-250"
      style={{
        background: "var(--nav-bg)",
        borderColor: "var(--border-subtle)",
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <a
          href="#"
          className="transition-opacity hover:opacity-80 focus-visible:opacity-80"
          aria-label={`${BRAND.name} — back to top`}
        >
          <AuralisBrand logoSize={36} size="lg" />
        </a>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-8">
            {BRAND.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-widest transition-colors hover:opacity-100 focus-visible:opacity-100"
                style={{
                  color: "var(--text-nav)",
                  fontFamily: "var(--font-jetbrains-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                {item.label}
              </a>
            ))}
            <a
              href={BRAND.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
              className="text-xs uppercase tracking-widest px-5 py-2 rounded-sm font-medium transition-opacity hover:opacity-80 focus-visible:opacity-80"
              style={{
                background: "var(--cta-bg)",
                color: "var(--cta-text)",
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.12em",
              }}
            >
              {BRAND.githubLabel}
            </a>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
