import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function Svg({ className, size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    />
  );
}

export function LogoMark(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 3v7" />
      <path d="M10 3v7" />
      <path d="M7 7h3" />
      <path d="M16 3c1.5 2 1.5 5 0 7" />
      <path d="M14 10h4" />
      <path d="M8.5 10v11" />
      <path d="M16 10v11" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </Svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3L7.5 7.5l3.3-1.2L12 3Z" />
      <path d="m18.5 13 0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8 0.8-2.2Z" />
      <path d="m5.5 14 0.7 1.8 1.8 0.7-1.8 0.7-0.7 1.8-0.7-1.8-1.8-0.7 1.8-0.7 0.7-1.8Z" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s-6-4.8-6-10a6 6 0 1 1 12 0c0 5.2-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.5 2" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </Svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </Svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </Svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 4.5c1.5 4.5 5 8 9.5 9.5l2-2c0.3-0.3 0.8-0.4 1.2-0.2l2 1a1 1 0 0 1 0.5 1.1c-0.5 2.6-2.8 4.4-5.5 4.1C9.6 17.3 4.7 12.4 3.9 5.8 3.6 3 5.4 0.7 8 0.2a1 1 0 0 1 1.1 0.5l1 2c0.2 0.4 0.1 0.9-0.2 1.2l-2 0.6Z" />
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.5 2.3 4 5.2 4 8.5s-1.5 6.2-4 8.5c-2.5-2.3-4-5.2-4-8.5s1.5-6.2 4-8.5Z" />
    </Svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.2 2.2 4.8-4.8" />
    </Svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20s-6.5-4.3-8.2-8C2.5 9.6 3.7 6.5 6.8 5.6c1.9-0.6 3.8 0.1 5.2 1.7 1.4-1.6 3.3-2.3 5.2-1.7 3.1 0.9 4.3 4 3 6.4C18.5 15.7 12 20 12 20Z" />
    </Svg>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4.5h10a1 1 0 0 1 1 1v14l-6-3-6 3v-14a1 1 0 0 1 1-1Z" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 5.5 5.5v5.7c0 4.3 2.5 7.9 6.5 9.8 4-1.9 6.5-5.5 6.5-9.8V5.5L12 3Z" />
      <path d="m9.5 12 1.6 1.6 3.4-3.6" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 3.5 18a1 1 0 0 0 0.9 1.5h15.2a1 1 0 0 0 0.9-1.5L12 3.5Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h.01" />
    </Svg>
  );
}
