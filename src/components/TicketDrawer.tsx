import { useRef, useState, type FormEvent } from 'react';
import { Building2, CalendarDays, Pencil, SendHorizontal, Trash2, UserRound, X } from 'lucide-react';
import { STATUSES, type Status, type Ticket } from '../types';
import { LIMITS } from '../lib/tickets';
import { describeEvent } from '../lib/history';
import { formatDateTime, safeClass, timeAgo } from '../lib/format';
import { closeOnBackdrop, useModal } from '../hooks/useModal';
import { EVENT_ICON, STATUS_ICON } from './icons';
import { Avatar, PriorityPill, StatusPill } from './Badges';

interface Props {
  ticket: Ticket;
  onClose: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onStatus: (id: number, status: Status) => void;
  onComment: (id: number, text: string) => void;
}

/** Painel lateral (no celular, uma folha que sobe de baixo) com tudo sobre o chamado. */
export function TicketDrawer({ ticket, onClose, onEdit, onDelete, onStatus, onComment }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useModal(ref);
  const [comment, setComment] = useState('');
  const events = [...ticket.history].reverse();

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!comment.trim()) return;
    onComment(ticket.id, comment);
    setComment('');
  }

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="drawerTitle" onClose={onClose} onClick={closeOnBackdrop(onClose)}>
      <div className="drawer-body">
        <span className="sheet-handle" aria-hidden="true" />
        <header className="drawer-header">
          <div>
            <div className="eyebrow">CHAMADO #{ticket.id}</div>
            <h2 id="drawerTitle">{ticket.title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar detalhes"><X size={20} /></button>
        </header>

        <div className="drawer-pills">
          <PriorityPill value={ticket.priority} />
          <StatusPill value={ticket.status} />
        </div>

        <section className="drawer-section">
          <h3>Mudar status</h3>
          <div className="segmented">
            {STATUSES.map((status) => {
              const Icon = STATUS_ICON[status];
              const current = ticket.status === status;
              return (
                <button key={status} type="button" className={`segment tone-${safeClass(status)} ${current ? 'checked' : ''}`} aria-pressed={current} onClick={() => onStatus(ticket.id, status)}>
                  <Icon size={16} />{status}
                </button>
              );
            })}
          </div>
        </section>

        <dl className="info-grid">
          <div>
            <dt><Building2 size={14} /> Cliente</dt>
            <dd>{ticket.client}</dd>
          </div>
          <div>
            <dt><UserRound size={14} /> Responsável</dt>
            <dd><Avatar name={ticket.owner} size={24} />{ticket.owner || 'Não atribuído'}</dd>
          </div>
          <div>
            <dt><CalendarDays size={14} /> Aberto em</dt>
            <dd>{formatDateTime(ticket.createdAt)} <span className="muted">({timeAgo(ticket.createdAt)})</span></dd>
          </div>
        </dl>

        {ticket.description && (
          <section className="drawer-section">
            <h3>Descrição</h3>
            <p className="drawer-description">{ticket.description}</p>
          </section>
        )}

        <div className="drawer-actions">
          <button type="button" className="button button-secondary" onClick={() => onEdit(ticket)}><Pencil size={16} /> Editar</button>
          <button type="button" className="button button-danger" onClick={() => onDelete(ticket)}><Trash2 size={16} /> Excluir</button>
        </div>

        <section className="drawer-section">
          <h3>Comentários e histórico</h3>
          <form className="comment-form" onSubmit={submit}>
            <textarea
              rows={2}
              value={comment}
              maxLength={LIMITS.comment}
              placeholder="Escreva um comentário para o time..."
              aria-label="Novo comentário"
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submit(); }}
            />
            <div className="comment-form-footer">
              <span className="hide-mobile">Ctrl + Enter para enviar</span>
              <button type="submit" className="button button-primary" disabled={!comment.trim()}>
                <SendHorizontal size={16} /> Comentar
              </button>
            </div>
          </form>
          <ol className="timeline">
            {events.map((event) => {
              const Icon = EVENT_ICON[event.type];
              return (
                <li key={event.id} className={event.type === 'comment' ? 'timeline-comment' : undefined}>
                  <span className={`event-icon event-${event.type}`}><Icon size={16} /></span>
                  <div className="timeline-body">
                    <p className="timeline-text">{describeEvent(event)}</p>
                    <time dateTime={event.at} title={formatDateTime(event.at)}>{timeAgo(event.at)}</time>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </dialog>
  );
}
