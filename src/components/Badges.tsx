import { useId, type CSSProperties } from 'react';
import type { Priority, Status } from '../types';
import { safeClass } from '../lib/format';
import { PRIORITY_ICON, STATUS_ICON } from './icons';

export function PriorityPill({ value }: { value: Priority }) {
  const Icon = PRIORITY_ICON[value];
  return <span className={`pill priority-${safeClass(value)}`}><Icon size={13} strokeWidth={2.5} />{value}</span>;
}

export function StatusPill({ value }: { value: Status }) {
  const Icon = STATUS_ICON[value];
  return <span className={`pill status-${safeClass(value)}`}><Icon size={13} strokeWidth={2.5} />{value}</span>;
}

/** Iniciais do nome numa bolinha. A cor sai do próprio nome: a mesma pessoa tem sempre a mesma cor. */
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name ? name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') : '?';
  let hue = 0;
  for (const char of name) hue = (hue * 31 + char.charCodeAt(0)) % 360;
  const style = { '--avatar-hue': hue, width: size, height: size, fontSize: size * 0.4 } as CSSProperties;
  return <span className={`avatar ${name ? '' : 'avatar-empty'}`} style={style} aria-hidden="true">{initials}</span>;
}

export function Logo({ className = 'brand-logo' }: { className?: string }) {
  // useId: a sidebar e a barra do celular desenham a logo; cada uma precisa do próprio gradiente.
  const gradientId = useId();
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#547bf7" />
          <stop offset="1" stopColor="#7c53e7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
      <path d="M22 16h22v7H30v7h12v7H30v11h-8z" fill="#fff" />
    </svg>
  );
}
