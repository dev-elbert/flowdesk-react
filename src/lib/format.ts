const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const relativeFormat = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date);
}

/** "há 5 minutos", "ontem", "há 3 dias". Depois de uma semana, mostra a data. */
export function timeAgo(value: string, now = Date.now()): string {
  const diff = new Date(value).getTime() - now;
  if (Number.isNaN(diff)) return '—';
  const abs = Math.abs(diff);
  if (abs < MINUTE) return 'agora mesmo';
  if (abs < HOUR) return relativeFormat.format(Math.round(diff / MINUTE), 'minute');
  if (abs < DAY) return relativeFormat.format(Math.round(diff / HOUR), 'hour');
  if (abs < 7 * DAY) return relativeFormat.format(Math.round(diff / DAY), 'day');
  return formatDate(value);
}

/** "Média" vira "media" e "Em andamento" vira "em-andamento": nome de classe CSS sem acento nem espaço. */
export function safeClass(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replaceAll(' ', '-');
}

/** Minúsculas e sem acento, para a busca achar "cobranca" em "Cobrança". */
export function fold(value: string): string {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
