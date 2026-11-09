export const PRIORITIES = ['Baixa', 'Média', 'Alta'] as const;
export const STATUSES = ['Aberto', 'Em andamento', 'Resolvido'] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

/** Cada mudança no chamado vira um evento, com data, para montar a linha do tempo. */
export type HistoryEvent =
  | { id: string; at: string; type: 'created' }
  | { id: string; at: string; type: 'edited' }
  | { id: string; at: string; type: 'status' | 'priority' | 'owner'; from: string; to: string }
  | { id: string; at: string; type: 'comment'; text: string };

export interface Ticket {
  id: number;
  title: string;
  client: string;
  priority: Priority;
  status: Status;
  owner: string;
  description: string;
  createdAt: string;
  history: HistoryEvent[];
}

/** Os campos que a pessoa preenche no formulário. */
export type TicketDraft = Pick<Ticket, 'title' | 'client' | 'priority' | 'status' | 'owner' | 'description'>;

export interface Filters {
  search: string;
  status: Status | 'todos';
  priority: Priority | 'todas';
}

export type View = 'painel' | 'lista' | 'quadro';
