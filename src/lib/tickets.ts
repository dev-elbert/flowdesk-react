import { PRIORITIES, STATUSES, type Filters, type HistoryEvent, type Priority, type Status, type Ticket, type TicketDraft } from '../types';
import { fold } from './format';

export const LIMITS = { title: 100, client: 70, owner: 60, description: 600, comment: 500 } as const;
export const EMPTY_FILTERS: Filters = { search: '', status: 'todos', priority: 'todas' };
export const EMPTY_DRAFT: TicketDraft = { title: '', client: '', priority: 'Média', status: 'Aberto', owner: '', description: '' };

export const isPriority = (value: unknown): value is Priority => PRIORITIES.includes(value as Priority);
export const isStatus = (value: unknown): value is Status => STATUSES.includes(value as Status);

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const isDate = (value: unknown): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value));

// ---------- Leitura e validação ----------

// O localStorage pode ter sido editado à mão ou vir da versão 1 (sem histórico):
// tudo passa por aqui antes de entrar no app, e o que for inválido é descartado.
function normalizeEvent(raw: unknown, fallbackId: string): HistoryEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const event = raw as Record<string, unknown>;
  const at = event.at;
  if (!isDate(at)) return null;
  const id = typeof event.id === 'string' && event.id ? event.id : fallbackId;
  switch (event.type) {
    case 'created':
      return { id, at, type: 'created' };
    case 'edited':
      return { id, at, type: 'edited' };
    case 'status':
    case 'priority':
    case 'owner': {
      const type = event.type as 'status' | 'priority' | 'owner';
      return { id, at, type, from: text(event.from, 100), to: text(event.to, 100) };
    }
    case 'comment': {
      const body = text(event.text, LIMITS.comment);
      return body ? { id, at, type: 'comment', text: body } : null;
    }
    default:
      return null;
  }
}

export function normalizeTicket(raw: unknown): Ticket | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  const title = text(record.title, LIMITS.title);
  const client = text(record.client, LIMITS.client);
  if (!Number.isInteger(id) || id <= 0 || !title || !client) return null;
  const createdAt = isDate(record.createdAt) ? record.createdAt : new Date().toISOString();
  const history = (Array.isArray(record.history) ? record.history : [])
    .map((event, index) => normalizeEvent(event, `${id}-${index}`))
    .filter((event): event is HistoryEvent => event !== null)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (!history.some((event) => event.type === 'created')) history.unshift({ id: `${id}-created`, at: createdAt, type: 'created' });
  return {
    id, title, client,
    priority: isPriority(record.priority) ? record.priority : 'Média',
    status: isStatus(record.status) ? record.status : 'Aberto',
    owner: text(record.owner, LIMITS.owner),
    description: text(record.description, LIMITS.description),
    createdAt,
    history,
  };
}

/** Lê a lista salva. Devolve null se o JSON estiver quebrado ou não for uma lista. */
export function parseTickets(json: string): Ticket[] | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    const seen = new Set<number>();
    const tickets: Ticket[] = [];
    for (const item of parsed) {
      const ticket = normalizeTicket(item);
      if (ticket && !seen.has(ticket.id)) {
        seen.add(ticket.id);
        tickets.push(ticket);
      }
    }
    return tickets;
  } catch {
    return null;
  }
}

// ---------- Criação e mudanças ----------

export const toDraft = ({ title, client, priority, status, owner, description }: Ticket): TicketDraft =>
  ({ title, client, priority, status, owner, description });

export const nextId = (tickets: Ticket[]) => Math.max(1000, ...tickets.map((ticket) => ticket.id)) + 1;

export function createTicket(id: number, draft: TicketDraft, at: string): Ticket {
  return { id, ...draft, createdAt: at, history: [{ id: `${id}-created`, at, type: 'created' }] };
}

// Toda mudança vira um evento no histórico, guardando o antes e o depois.
export function applyEdit(ticket: Ticket, draft: TicketDraft, at: string): Ticket {
  const events: HistoryEvent[] = [];
  const eventId = () => `${ticket.id}-${Date.parse(at)}-${ticket.history.length + events.length}`;
  if (draft.status !== ticket.status) events.push({ id: eventId(), at, type: 'status', from: ticket.status, to: draft.status });
  if (draft.priority !== ticket.priority) events.push({ id: eventId(), at, type: 'priority', from: ticket.priority, to: draft.priority });
  if (draft.owner !== ticket.owner) events.push({ id: eventId(), at, type: 'owner', from: ticket.owner, to: draft.owner });
  if (draft.title !== ticket.title || draft.client !== ticket.client || draft.description !== ticket.description) {
    events.push({ id: eventId(), at, type: 'edited' });
  }
  if (events.length === 0) return ticket;
  return { ...ticket, ...draft, history: [...ticket.history, ...events] };
}

export const changeStatus = (ticket: Ticket, status: Status, at: string) => applyEdit(ticket, { ...toDraft(ticket), status }, at);

export function addComment(ticket: Ticket, body: string, at: string): Ticket {
  const comment = body.trim().slice(0, LIMITS.comment);
  if (!comment) return ticket;
  const event: HistoryEvent = { id: `${ticket.id}-${Date.parse(at)}-${ticket.history.length}`, at, type: 'comment', text: comment };
  return { ...ticket, history: [...ticket.history, event] };
}

// ---------- Busca, filtros e ordenação ----------

export function filterTickets(tickets: Ticket[], { search, status, priority }: Filters): Ticket[] {
  const term = fold(search.trim());
  return tickets.filter((ticket) =>
    (status === 'todos' || ticket.status === status) &&
    (priority === 'todas' || ticket.priority === priority) &&
    (!term || [ticket.title, ticket.client, ticket.owner, String(ticket.id)].some((value) => fold(value).includes(term))));
}

export type SortKey = 'id' | 'title' | 'client' | 'priority' | 'status' | 'owner' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export function sortTickets(tickets: Ticket[], key: SortKey, direction: SortDirection): Ticket[] {
  const factor = direction === 'asc' ? 1 : -1;
  const value = (ticket: Ticket): number | string => {
    switch (key) {
      case 'id': return ticket.id;
      case 'priority': return PRIORITIES.indexOf(ticket.priority);
      case 'status': return STATUSES.indexOf(ticket.status);
      case 'createdAt': return Date.parse(ticket.createdAt) || 0;
      default: return ticket[key];
    }
  };
  return [...tickets].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    const compared = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR');
    return (compared || a.id - b.id) * factor;
  });
}

export function knownOwners(tickets: Ticket[]): string[] {
  return [...new Set(tickets.map((ticket) => ticket.owner).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// ---------- Números do painel ----------

export function countByStatus(tickets: Ticket[]): Record<Status, number> {
  const counts: Record<Status, number> = { Aberto: 0, 'Em andamento': 0, Resolvido: 0 };
  for (const ticket of tickets) counts[ticket.status] += 1;
  return counts;
}

export function countByPriority(tickets: Ticket[]): Record<Priority, number> {
  const counts: Record<Priority, number> = { Baixa: 0, Média: 0, Alta: 0 };
  for (const ticket of tickets) counts[ticket.priority] += 1;
  return counts;
}

export interface DayActivity {
  key: string;
  label: string;
  isToday: boolean;
  created: number;
  resolved: number;
}

/** Chamados abertos e resolvidos em cada um dos últimos dias, no fuso de quem está usando. */
export function dailyActivity(tickets: Ticket[], days = 7, now = new Date()): DayActivity[] {
  const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
  const buckets = Array.from({ length: days }, (_, index): DayActivity => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - index));
    return { key: dayKey(date), label: weekday.format(date).replace('.', ''), isToday: index === days - 1, created: 0, resolved: 0 };
  });
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const ticket of tickets) {
    const created = byKey.get(dayKey(new Date(ticket.createdAt)));
    if (created) created.created += 1;
    for (const event of ticket.history) {
      if (event.type !== 'status' || event.to !== 'Resolvido') continue;
      const resolved = byKey.get(dayKey(new Date(event.at)));
      if (resolved) resolved.resolved += 1;
    }
  }
  return buckets;
}

export function recentActivity(tickets: Ticket[], limit = 6): { ticket: Ticket; event: HistoryEvent }[] {
  return tickets
    .flatMap((ticket) => ticket.history.map((event) => ({ ticket, event })))
    .sort((a, b) => Date.parse(b.event.at) - Date.parse(a.event.at))
    .slice(0, limit);
}
