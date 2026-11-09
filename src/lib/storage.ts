import type { Ticket } from '../types';
import { makeExamples } from '../data/examples';
import { parseTickets } from './tickets';

// Este projeto usa localStorage para funcionar sem servidor.
// Os dados são apenas de demonstração; NÃO insira informações sensíveis reais.
export const STORAGE_KEY = 'flowdesk_tickets_v2';
// Chave da versão 1 (HTML puro). As duas ficam no mesmo domínio do GitHub Pages,
// então quem já usou a v1 vê os próprios chamados aqui na primeira visita.
const LEGACY_KEY = 'flowdesk_tickets_v1';

export function loadTickets(): Ticket[] {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) return parseTickets(current) ?? makeExamples();
    const legacy = localStorage.getItem(LEGACY_KEY);
    const migrated = legacy === null ? null : parseTickets(legacy);
    if (migrated && migrated.length > 0) return migrated;
  } catch (error) {
    console.warn('Não foi possível ler o armazenamento local.', error);
  }
  return makeExamples();
}

/** Devolve false quando o navegador não deixa salvar (modo privado, cota cheia). */
export function saveTickets(tickets: Ticket[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return true;
  } catch (error) {
    console.warn('Não foi possível salvar.', error);
    return false;
  }
}
