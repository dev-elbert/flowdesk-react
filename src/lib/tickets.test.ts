import { describe, expect, it } from 'vitest';
import {
  addComment, applyEdit, changeStatus, createTicket, dailyActivity, EMPTY_FILTERS, filterTickets,
  nextId, parseTickets, sortTickets, toDraft,
} from './tickets';
import { makeExamples } from '../data/examples';

const AT = '2026-11-01T10:00:00.000Z';
const LATER = '2026-11-02T10:00:00.000Z';
const base = createTicket(1001, { title: 'Erro no login', client: 'Aurora', priority: 'Alta', status: 'Aberto', owner: 'Ana', description: '' }, AT);
const other = createTicket(1002, { title: 'Ajuste na cobrança', client: 'Solaris', priority: 'Baixa', status: 'Resolvido', owner: '', description: '' }, AT);

describe('parseTickets', () => {
  it('descarta itens inválidos e números repetidos', () => {
    const json = JSON.stringify([base, { ...base }, { id: 'x', title: 'a', client: 'b' }, null, { id: 2000, title: '', client: 'c' }]);
    expect(parseTickets(json)?.map((ticket) => ticket.id)).toEqual([1001]);
  });

  it('migra chamados da versão 1, que não tinham histórico', () => {
    const [ticket] = parseTickets(JSON.stringify([{ id: 1042, title: 'X', client: 'Y', priority: 'Urgente', status: 'Aberto', createdAt: AT }]))!;
    expect(ticket.priority).toBe('Média');
    expect(ticket.history).toEqual([{ id: '1042-created', at: AT, type: 'created' }]);
  });

  it('devolve null para JSON quebrado ou que não é lista', () => {
    expect(parseTickets('{')).toBeNull();
    expect(parseTickets('{"id":1}')).toBeNull();
  });
});

describe('mudanças no chamado', () => {
  it('registra no histórico cada campo que mudou', () => {
    const edited = applyEdit(base, { ...toDraft(base), status: 'Resolvido', owner: 'Pedro' }, LATER);
    expect(edited.status).toBe('Resolvido');
    expect(edited.history.slice(1)).toMatchObject([
      { type: 'status', from: 'Aberto', to: 'Resolvido' },
      { type: 'owner', from: 'Ana', to: 'Pedro' },
    ]);
  });

  it('não cria evento quando nada mudou', () => {
    expect(applyEdit(base, toDraft(base), LATER)).toBe(base);
    expect(changeStatus(base, 'Aberto', LATER)).toBe(base);
  });

  it('ignora comentário vazio', () => {
    expect(addComment(base, '   ', LATER)).toBe(base);
    expect(addComment(base, ' Olá ', LATER).history.at(-1)).toMatchObject({ type: 'comment', text: 'Olá' });
  });

  it('gera o próximo número a partir do maior', () => {
    expect(nextId([])).toBe(1001);
    expect(nextId([base, other])).toBe(1003);
  });
});

describe('busca e ordenação', () => {
  it('busca sem diferenciar maiúscula nem acento', () => {
    expect(filterTickets([base, other], { ...EMPTY_FILTERS, search: 'COBRANCA' })).toEqual([other]);
    expect(filterTickets([base, other], { ...EMPTY_FILTERS, search: '1001' })).toEqual([base]);
  });

  it('combina filtros de status e prioridade', () => {
    expect(filterTickets([base, other], { search: '', status: 'Resolvido', priority: 'Alta' })).toEqual([]);
    expect(filterTickets([base, other], { search: '', status: 'todos', priority: 'Alta' })).toEqual([base]);
  });

  it('ordena prioridade pela gravidade, não pelo alfabeto', () => {
    expect(sortTickets([base, other], 'priority', 'desc').map((ticket) => ticket.priority)).toEqual(['Alta', 'Baixa']);
  });
});

describe('números do painel', () => {
  it('conta abertos e resolvidos por dia', () => {
    const now = new Date(2026, 10, 2, 18);
    const created = createTicket(1, { ...toDraft(base) }, new Date(2026, 10, 2, 9).toISOString());
    const resolved = changeStatus(created, 'Resolvido', new Date(2026, 10, 2, 11).toISOString());
    const days = dailyActivity([resolved], 7, now);
    expect(days).toHaveLength(7);
    expect(days.at(-1)).toMatchObject({ isToday: true, created: 1, resolved: 1 });
    expect(days.slice(0, -1).every((day) => day.created === 0 && day.resolved === 0)).toBe(true);
  });

  it('os exemplos nunca ficam com data no futuro', () => {
    const now = Date.now();
    const events = makeExamples(now).flatMap((ticket) => ticket.history);
    expect(events.every((event) => Date.parse(event.at) <= now)).toBe(true);
  });
});
