import type { Ticket } from '../types';
import { formatDate } from './format';

// Ponto e vírgula e BOM UTF-8 para o Excel em português abrir com acentos e colunas certas.
// Valores que começam com = + - @ ganham um apóstrofo para não virarem fórmula (CSV injection).
export function toCsvValue(value: unknown): string {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function ticketsToCsv(tickets: Ticket[]): string {
  const header = ['Número', 'Título', 'Cliente', 'Prioridade', 'Status', 'Responsável', 'Criado em', 'Descrição', 'Comentários'];
  const rows = tickets.map((t) => [
    t.id, t.title, t.client, t.priority, t.status, t.owner, formatDate(t.createdAt), t.description,
    t.history.filter((event) => event.type === 'comment').length,
  ]);
  return [header, ...rows].map((row) => row.map(toCsvValue).join(';')).join('\r\n');
}

export function downloadCsv(csv: string, filename: string): void {
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
