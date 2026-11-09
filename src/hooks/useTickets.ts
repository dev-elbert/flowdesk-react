import { useEffect, useReducer, useRef } from 'react';
import type { Status, Ticket, TicketDraft } from '../types';
import { addComment, applyEdit, changeStatus, createTicket, nextId } from '../lib/tickets';
import { loadTickets, saveTickets } from '../lib/storage';
import { makeExamples } from '../data/examples';

// A data e o número vêm prontos na ação, para o reducer ser uma função pura.
type Action =
  | { type: 'create'; id: number; draft: TicketDraft; at: string }
  | { type: 'update'; id: number; draft: TicketDraft; at: string }
  | { type: 'status'; id: number; status: Status; at: string }
  | { type: 'comment'; id: number; text: string; at: string }
  | { type: 'delete'; id: number }
  | { type: 'restore'; ticket: Ticket }
  | { type: 'reset'; tickets: Ticket[] };

function reducer(state: Ticket[], action: Action): Ticket[] {
  const update = (id: number, change: (ticket: Ticket) => Ticket) =>
    state.map((ticket) => (ticket.id === id ? change(ticket) : ticket));
  switch (action.type) {
    case 'create':
      return [createTicket(action.id, action.draft, action.at), ...state];
    case 'update': {
      const { draft, at } = action;
      return update(action.id, (ticket) => applyEdit(ticket, draft, at));
    }
    case 'status': {
      const { status, at } = action;
      return update(action.id, (ticket) => changeStatus(ticket, status, at));
    }
    case 'comment': {
      const { text, at } = action;
      return update(action.id, (ticket) => addComment(ticket, text, at));
    }
    case 'delete':
      return state.filter((ticket) => ticket.id !== action.id);
    case 'restore':
      return state.some((ticket) => ticket.id === action.ticket.id) ? state : [action.ticket, ...state];
    case 'reset':
      return action.tickets;
  }
}

export function useTickets(onSaveError: () => void) {
  const [tickets, dispatch] = useReducer(reducer, undefined, loadTickets);
  const onSaveErrorRef = useRef(onSaveError);

  useEffect(() => {
    onSaveErrorRef.current = onSaveError;
  });

  useEffect(() => {
    if (!saveTickets(tickets)) onSaveErrorRef.current();
  }, [tickets]);

  const now = () => new Date().toISOString();

  return {
    tickets,
    create(draft: TicketDraft): number {
      const id = nextId(tickets);
      dispatch({ type: 'create', id, draft, at: now() });
      return id;
    },
    update: (id: number, draft: TicketDraft) => dispatch({ type: 'update', id, draft, at: now() }),
    setStatus: (id: number, status: Status) => dispatch({ type: 'status', id, status, at: now() }),
    comment: (id: number, text: string) => dispatch({ type: 'comment', id, text, at: now() }),
    remove: (id: number) => dispatch({ type: 'delete', id }),
    restore: (ticket: Ticket) => dispatch({ type: 'restore', ticket }),
    reset: () => dispatch({ type: 'reset', tickets: makeExamples() }),
  };
}
