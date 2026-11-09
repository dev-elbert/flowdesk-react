import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import type { Ticket } from '../types';
import { sortTickets, type SortDirection, type SortKey } from '../lib/tickets';
import { formatDate, formatDateTime, timeAgo } from '../lib/format';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { Avatar, PriorityPill, StatusPill } from './Badges';
import { EmptyState } from './EmptyState';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Chamado' },
  { key: 'client', label: 'Cliente' },
  { key: 'priority', label: 'Prioridade' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Responsável' },
  { key: 'createdAt', label: 'Criado em' },
];

const commentCount = (ticket: Ticket) => ticket.history.filter((event) => event.type === 'comment').length;

interface Props {
  tickets: Ticket[];
  hasTickets: boolean;
  onOpen: (id: number) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onClearFilters: () => void;
}

export function TicketList({ tickets, hasTickets, onOpen, onEdit, onDelete, onClearFilters }: Props) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'id', direction: 'desc' });
  const sorted = useMemo(() => sortTickets(tickets, sort.key, sort.direction), [tickets, sort]);

  if (tickets.length === 0) return <EmptyState hasTickets={hasTickets} onClearFilters={onClearFilters} />;

  // Primeiro clique ordena do jeito mais útil (data e prioridade: maiores primeiro); o segundo inverte.
  const toggleSort = (key: SortKey) =>
    setSort((current) => current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: key === 'createdAt' || key === 'priority' ? 'desc' : 'asc' });

  if (isMobile) {
    return (
      <ul className="ticket-cards">
        {sorted.map((ticket) => {
          const comments = commentCount(ticket);
          return (
            <li key={ticket.id}>
              <button type="button" className="ticket-card" onClick={() => onOpen(ticket.id)}>
                <span className="card-row">
                  <PriorityPill value={ticket.priority} />
                  <StatusPill value={ticket.status} />
                  <span className="ticket-id card-id">#{ticket.id}</span>
                </span>
                <span className="ticket-name">{ticket.title}</span>
                <span className="card-meta">
                  <span className="owner-cell"><Avatar name={ticket.owner} size={22} />{ticket.client}</span>
                  <span className="owner-cell">
                    {comments > 0 && <span className="meta-chip"><MessageSquare size={13} />{comments}</span>}
                    {timeAgo(ticket.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="table-scroll">
      <table className="ticket-table">
        <thead>
          <tr>
            {COLUMNS.map(({ key, label }) => {
              const active = sort.key === key;
              const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th key={key} scope="col" aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className={`sort-button ${active ? 'active' : ''}`} onClick={() => toggleSort(key)}>
                    {label}<Icon size={13} />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="th-static"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ticket) => (
            <tr
              key={ticket.id}
              className="ticket-row"
              tabIndex={0}
              onClick={() => onOpen(ticket.id)}
              onKeyDown={(event) => { if (event.key === 'Enter' && event.target === event.currentTarget) onOpen(ticket.id); }}
            >
              <td>
                <div className="ticket-name">{ticket.title}</div>
                {ticket.description && <div className="ticket-desc">{ticket.description}</div>}
                <div className="ticket-id">
                  #{ticket.id}
                  {commentCount(ticket) > 0 && <span className="meta-chip"><MessageSquare size={12} />{commentCount(ticket)}</span>}
                </div>
              </td>
              <td>{ticket.client}</td>
              <td><PriorityPill value={ticket.priority} /></td>
              <td><StatusPill value={ticket.status} /></td>
              <td><span className="owner-cell"><Avatar name={ticket.owner} size={26} />{ticket.owner || 'Não atribuído'}</span></td>
              <td title={formatDateTime(ticket.createdAt)}>{formatDate(ticket.createdAt)}</td>
              <td>
                <div className="row-actions">
                  <button type="button" className="icon-button small" title="Editar" aria-label={`Editar chamado ${ticket.id}`} onClick={(event) => { event.stopPropagation(); onEdit(ticket); }}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" className="icon-button small danger" title="Excluir" aria-label={`Excluir chamado ${ticket.id}`} onClick={(event) => { event.stopPropagation(); onDelete(ticket); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
