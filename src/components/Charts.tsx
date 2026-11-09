import { useState, type CSSProperties } from 'react';
import { PRIORITIES, STATUSES, type Priority, type Status, type Ticket } from '../types';
import { recentActivity, type DayActivity } from '../lib/tickets';
import { describeEvent } from '../lib/history';
import { safeClass, timeAgo } from '../lib/format';
import { useMounted } from '../hooks/useAnimation';
import { EVENT_ICON, PRIORITY_ICON } from './icons';

// Gráficos feitos com SVG e CSS, sem biblioteca: leves, animados e acessíveis.

const SIZE = 160;
const CENTER = SIZE / 2;
const RADIUS = 62;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDonut({ counts, onSelect }: { counts: Record<Status, number>; onSelect: (status: Status) => void }) {
  const mounted = useMounted();
  const [active, setActive] = useState<Status | null>(null);
  const total = STATUSES.reduce((sum, status) => sum + counts[status], 0);
  let offset = 0;
  const segments = STATUSES.map((status) => {
    const length = total && mounted ? (counts[status] / total) * CIRCUMFERENCE : 0;
    const segment = { status, length, offset };
    offset += length;
    return segment;
  });
  const summary = STATUSES.map((status) => `${counts[status]} ${status.toLowerCase()}`).join(', ');

  return (
    <div className="donut-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={`donut ${active ? 'has-active' : ''}`} role="img" aria-label={`Chamados por status: ${summary}.`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" strokeWidth={STROKE} className="donut-track" />
        {segments.map(({ status, length, offset: start }) => (
          <circle
            key={status}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={active === status ? STROKE + 5 : STROKE}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className={`donut-seg tone-${safeClass(status)} ${active === status ? 'active' : ''}`}
            style={{ strokeDasharray: `${length} ${CIRCUMFERENCE - length}`, strokeDashoffset: -start }}
            onMouseEnter={() => setActive(status)}
            onMouseLeave={() => setActive(null)}
            onClick={() => onSelect(status)}
          />
        ))}
        <text x={CENTER} y={CENTER + 4} textAnchor="middle" className="donut-value">{active ? counts[active] : total}</text>
        <text x={CENTER} y={CENTER + 24} textAnchor="middle" className="donut-label">{active ?? 'chamados'}</text>
      </svg>
      <ul className="legend">
        {STATUSES.map((status) => (
          <li key={status}>
            <button
              type="button"
              className={active === status ? 'active' : ''}
              onMouseEnter={() => setActive(status)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(status)}
              onBlur={() => setActive(null)}
              onClick={() => onSelect(status)}
            >
              <span className={`legend-dot tone-${safeClass(status)}`} />
              {status}
              <strong>{counts[status]}</strong>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PriorityBars({ counts, onSelect }: { counts: Record<Priority, number>; onSelect: (priority: Priority) => void }) {
  const mounted = useMounted();
  const max = Math.max(1, ...PRIORITIES.map((priority) => counts[priority]));
  return (
    <ul className="hbars">
      {[...PRIORITIES].reverse().map((priority, index) => {
        const Icon = PRIORITY_ICON[priority];
        const width = mounted ? `${(counts[priority] / max) * 100}%` : '0%';
        return (
          <li key={priority}>
            <button type="button" className={`hbar tone-${safeClass(priority)}`} onClick={() => onSelect(priority)} aria-label={`${priority}: ${counts[priority]} chamados. Ver na lista.`}>
              <span className="hbar-label"><Icon size={16} strokeWidth={2.5} />{priority}</span>
              <span className="hbar-track"><span className="hbar-fill" style={{ width, transitionDelay: `${index * 80}ms` }} /></span>
              <strong>{counts[priority]}</strong>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityChart({ data }: { data: DayActivity[] }) {
  const mounted = useMounted();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((day) => Math.max(day.created, day.resolved)));
  const height = (value: number) => (mounted ? `${(value / max) * 100}%` : '0%');
  const totalCreated = data.reduce((sum, day) => sum + day.created, 0);
  const totalResolved = data.reduce((sum, day) => sum + day.resolved, 0);

  return (
    <div className="activity">
      <div className="activity-legend">
        <span><i className="legend-dot tone-created" />Abertos <strong>{totalCreated}</strong></span>
        <span><i className="legend-dot tone-resolvido" />Resolvidos <strong>{totalResolved}</strong></span>
      </div>
      <div
        className="activity-chart"
        style={{ '--days': data.length } as CSSProperties}
        role="img"
        aria-label={`Nos últimos ${data.length} dias: ${totalCreated} chamados abertos e ${totalResolved} resolvidos.`}
      >
        {data.map((day, index) => (
          <div
            key={day.key}
            className={`activity-day ${hover === index ? 'hover' : ''} ${day.isToday ? 'today' : ''}`}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setHover(hover === index ? null : index)}
          >
            {hover === index && (
              <div className="activity-tip">{day.created} abertos · {day.resolved} resolvidos</div>
            )}
            <div className="activity-bars">
              <span className="bar tone-created" style={{ height: height(day.created), transitionDelay: `${index * 50}ms` }} />
              <span className="bar tone-resolvido" style={{ height: height(day.resolved), transitionDelay: `${index * 50 + 25}ms` }} />
            </div>
            <span className="activity-label">{day.isToday ? 'hoje' : day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentActivity({ tickets, onOpen }: { tickets: Ticket[]; onOpen: (id: number) => void }) {
  const items = recentActivity(tickets, 6);
  if (items.length === 0) return <p className="muted">Nada por aqui ainda.</p>;
  return (
    <ol className="recent">
      {items.map(({ ticket, event }) => {
        const Icon = EVENT_ICON[event.type];
        return (
          <li key={`${ticket.id}-${event.id}`}>
            <button type="button" onClick={() => onOpen(ticket.id)}>
              <span className={`event-icon event-${event.type}`}><Icon size={16} /></span>
              <span className="recent-text">
                <strong>#{ticket.id} · {ticket.title}</strong>
                <span>{describeEvent(event)}</span>
              </span>
              <time dateTime={event.at}>{timeAgo(event.at)}</time>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
