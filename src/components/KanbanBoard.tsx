import { useState, type MouseEvent } from 'react';
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor, pointerWithin, useDraggable, useDroppable,
  useSensor, useSensors, type Announcements, type DragEndEvent,
} from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { STATUSES, type Status, type Ticket } from '../types';
import { isStatus } from '../lib/tickets';
import { safeClass, timeAgo } from '../lib/format';
import { STATUS_ICON } from './icons';
import { Avatar, PriorityPill } from './Badges';

// Avisos em português para leitores de tela durante o arraste.
const announcements: Announcements = {
  onDragStart: ({ active }) => `Chamado #${active.id} selecionado.`,
  onDragOver: ({ active, over }) => (over ? `Chamado #${active.id} sobre a coluna ${over.id}.` : `Chamado #${active.id} fora das colunas.`),
  onDragEnd: ({ active, over }) => (over ? `Chamado #${active.id} movido para ${over.id}.` : `Chamado #${active.id} solto fora das colunas.`),
  onDragCancel: ({ active }) => `Movimento do chamado #${active.id} cancelado.`,
};

interface Props {
  tickets: Ticket[];
  onOpen: (id: number) => void;
  onMove: (id: number, status: Status) => void;
}

export function KanbanBoard({ tickets, onOpen, onMove }: Props) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // No toque, segurar 200 ms antes de arrastar: assim a rolagem da tela continua funcionando.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragging = tickets.find((ticket) => ticket.id === draggingId) ?? null;

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null);
    if (over && isStatus(over.id)) onMove(Number(active.id), over.id);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: 'Use os botões de seta do cartão para mudar de coluna, ou arraste com o mouse ou com o dedo.' },
      }}
      onDragStart={({ active }) => setDraggingId(Number(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingId(null)}
    >
      <div className="kanban">
        {STATUSES.map((status, index) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={tickets.filter((ticket) => ticket.status === status).sort((a, b) => b.id - a.id)}
            prev={STATUSES[index - 1]}
            next={STATUSES[index + 1]}
            onOpen={onOpen}
            onMove={onMove}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(.2, .8, .2, 1)' }}>
        {dragging && (
          <article className={`kanban-card overlay tone-${safeClass(dragging.priority)}`}>
            <CardContent ticket={dragging} />
          </article>
        )}
      </DragOverlay>
    </DndContext>
  );
}

interface ColumnProps {
  status: Status;
  tickets: Ticket[];
  prev?: Status;
  next?: Status;
  onOpen: (id: number) => void;
  onMove: (id: number, status: Status) => void;
}

function KanbanColumn({ status, tickets, prev, next, onOpen, onMove }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const Icon = STATUS_ICON[status];
  return (
    <section ref={setNodeRef} className={`kanban-column tone-${safeClass(status)} ${isOver ? 'over' : ''}`} aria-label={`Coluna ${status}`}>
      <header className="kanban-header">
        <Icon size={18} />
        {status}
        <span className="kanban-count">{tickets.length}</span>
      </header>
      <div className="kanban-list">
        {tickets.length === 0
          ? <div className="kanban-empty">Arraste um chamado para cá</div>
          : tickets.map((ticket) => <DraggableCard key={ticket.id} ticket={ticket} prev={prev} next={next} onOpen={onOpen} onMove={onMove} />)}
      </div>
    </section>
  );
}

function DraggableCard({ ticket, prev, next, onOpen, onMove }: Omit<ColumnProps, 'status' | 'tickets'> & { ticket: Ticket }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: ticket.id });
  const move = (status: Status) => (event: MouseEvent) => {
    event.stopPropagation();
    onMove(ticket.id, status);
  };
  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-roledescription="cartão arrastável"
      aria-label={`Chamado #${ticket.id}: ${ticket.title}. Enter abre os detalhes.`}
      className={`kanban-card tone-${safeClass(ticket.priority)} ${isDragging ? 'dragging' : ''}`}
      onClick={() => onOpen(ticket.id)}
      onKeyDown={(event) => { if (event.key === 'Enter' && event.target === event.currentTarget) onOpen(ticket.id); }}
    >
      <CardContent ticket={ticket} />
      {(prev || next) && (
        <div className="move-buttons">
          {prev && (
            <button type="button" className="move-button" onClick={move(prev)} aria-label={`Mover para ${prev}`}>
              <ChevronLeft size={15} />{prev}
            </button>
          )}
          {next && (
            <button type="button" className="move-button next" onClick={move(next)} aria-label={`Mover para ${next}`}>
              {next}<ChevronRight size={15} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function CardContent({ ticket }: { ticket: Ticket }) {
  const comments = ticket.history.filter((event) => event.type === 'comment').length;
  return (
    <>
      <div className="kanban-card-top">
        <span className="ticket-id">#{ticket.id}</span>
        <PriorityPill value={ticket.priority} />
      </div>
      <h3>{ticket.title}</h3>
      <div className="kanban-card-meta">
        <Avatar name={ticket.owner} size={24} />
        <span className="kanban-client">{ticket.client}</span>
        <span className="spacer" />
        {comments > 0 && <span className="meta-chip" title={`${comments} comentário(s)`}><MessageSquare size={13} />{comments}</span>}
        <span>{timeAgo(ticket.createdAt)}</span>
      </div>
    </>
  );
}
