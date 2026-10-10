import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const SunIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const MoonIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)

export const SpeakerIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
)

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowUpRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

// Ο «ακούραστος ήλιος» του Ομήρου: κύκλος με ακτίνες που περιστρέφεται αργά.
export function SunMark({ className }: { className?: string }) {
  const rays = Array.from({ length: 72 }, (_, i) => i * 5)
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true">
      <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="200" cy="200" r="104" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
      <g className="sun-rays">
        {rays.map((deg) => (
          <line
            key={deg}
            x1="200"
            y1={deg % 15 === 0 ? 50 : 62}
            x2="200"
            y2="70"
            stroke="currentColor"
            strokeWidth={deg % 15 === 0 ? 1.2 : 0.7}
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
      </g>
      <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 10" />
    </svg>
  )
}
