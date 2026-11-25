import { UI_ICONS, type UiIconName } from "./uiIcons";

/** A Phosphor icon, decorative by default (the text next to it says what it is). */
export default function Icon({ name, size = 20, label, className }: { name: UiIconName; size?: number; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} fill="currentColor" className={className}
      aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      {UI_ICONS[name].map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
