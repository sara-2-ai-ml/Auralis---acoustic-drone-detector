interface AuralisLogoProps {
  size?: number;
  className?: string;
}

export default function AuralisLogo({ size = 32, className }: AuralisLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="5" fill="var(--logo-bg)" />
      <rect x="3.5" y="19" width="1.3" height="3" fill="var(--logo-fg)" />
      <rect x="5.9" y="17" width="1.3" height="5" fill="var(--logo-fg)" />
      <rect x="8.3" y="15" width="1.3" height="7" fill="var(--logo-fg)" />
      <rect x="10.7" y="13" width="1.3" height="9" fill="var(--logo-fg)" />
      <rect x="13.1" y="11" width="1.3" height="11" fill="var(--logo-fg)" />
      <line
        x1="16"
        y1="8"
        x2="16"
        y2="24"
        stroke="var(--logo-fg)"
        strokeWidth="0.55"
      />
      <text
        x="16"
        y="21.2"
        textAnchor="middle"
        fill="var(--logo-fg)"
        fontFamily="ui-monospace, monospace"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="-0.4"
      >
        AU
      </text>
      <path
        d="M18.2 16 A3.2 3.2 0 0 1 21.4 19.2"
        stroke="var(--logo-fg)"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path
        d="M18.2 16 A5.8 5.8 0 0 1 24 21.8"
        stroke="var(--logo-fg)"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      <path
        d="M18.2 16 A8.4 8.4 0 0 1 26.6 24.4"
        stroke="var(--logo-fg)"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
    </svg>
  );
}
