import type { HistoryEvent } from '../types';

export function describeEvent(event: HistoryEvent): string {
  switch (event.type) {
    case 'created': return 'Chamado aberto';
    case 'edited': return 'Dados do chamado editados';
    case 'comment': return event.text;
    case 'status': return `Status: ${event.from} → ${event.to}`;
    case 'priority': return `Prioridade: ${event.from} → ${event.to}`;
    case 'owner': return `Responsável: ${event.from || 'Não atribuído'} → ${event.to || 'Não atribuído'}`;
  }
}
