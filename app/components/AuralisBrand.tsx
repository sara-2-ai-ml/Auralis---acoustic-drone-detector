import AuralisLogo from "@/app/components/AuralisLogo";
import { BRAND } from "@/app/lib/brand";

interface AuralisBrandProps {
  logoSize?: number;
  showTagline?: boolean;
  /** Larger wordmark for navbar */
  size?: "default" | "lg";
  className?: string;
}

export default function AuralisBrand({
  logoSize = 32,
  showTagline = false,
  size = "default",
  className = "",
}: AuralisBrandProps) {
  const nameClass =
    size === "lg"
      ? "font-semibold text-lg tracking-wide"
      : "font-semibold text-sm tracking-wide";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AuralisLogo size={logoSize} className="shrink-0" />
      <div className="flex flex-col leading-tight">
        <span
          className={nameClass}
          style={{ fontFamily: "var(--font-space-grotesk)", color: "var(--text-primary)" }}
        >
          {BRAND.name}
        </span>
        {showTagline && (
          <span
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-inter)" }}
          >
            {BRAND.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
