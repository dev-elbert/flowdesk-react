import { describe, expect, it } from 'vitest';
import { ticketsToCsv, toCsvValue } from './csv';
import { createTicket } from './tickets';

describe('toCsvValue', () => {
  it('coloca aspas e duplica as aspas internas', () => {
    expect(toCsvValue('Diz "oi"')).toBe('"Diz ""oi"""');
  });

  it('neutraliza valores que o Excel trataria como fórmula', () => {
    expect(toCsvValue('=SOMA(A1:A9)')).toBe(`"'=SOMA(A1:A9)"`);
    expect(toCsvValue('@cmd')).toBe(`"'@cmd"`);
  });
});

describe('ticketsToCsv', () => {
  it('gera cabeçalho e uma linha por chamado, separados por ponto e vírgula', () => {
    const ticket = createTicket(1001, { title: 'Erro', client: 'Aurora', priority: 'Alta', status: 'Aberto', owner: '', description: '' }, '2026-11-01T10:00:00.000Z');
    const [header, row] = ticketsToCsv([ticket]).split('\r\n');
    expect(header.startsWith('"Número";"Título"')).toBe(true);
    expect(row.startsWith('"1001";"Erro";"Aurora";"Alta";"Aberto"')).toBe(true);
  });
});
