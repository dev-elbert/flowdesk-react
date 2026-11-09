import type { RefObject } from 'react';
import { FilterX, Search, X } from 'lucide-react';
import { PRIORITIES, STATUSES, type Filters } from '../types';
import { EMPTY_FILTERS } from '../lib/tickets';
import { plural } from '../lib/format';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showStatus: boolean;
  count: number;
  searchRef: RefObject<HTMLInputElement>;
}

export function FiltersBar({ filters, onChange, showStatus, count, searchRef }: Props) {
  const active = filters.search !== '' || filters.priority !== 'todas' || (showStatus && filters.status !== 'todos');
  return (
    <div className="filters">
      <label className="search-wrap">
        <Search size={18} aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          placeholder="Buscar título, cliente, pessoa ou nº"
          aria-label="Buscar chamados"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
        {filters.search ? (
          <button type="button" className="icon-button small" aria-label="Limpar busca" onClick={() => onChange({ ...filters, search: '' })}>
            <X size={16} />
          </button>
        ) : (
          <kbd className="kbd-hint" title="Atalho para buscar">/</kbd>
        )}
      </label>
      {showStatus && (
        <label className="select-wrap">
          Status
          <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as Filters['status'] })}>
            <option value="todos">Todos</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      )}
      <label className="select-wrap">
        Prioridade
        <select value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value as Filters['priority'] })}>
          <option value="todas">Todas</option>
          {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
        </select>
      </label>
      <span className="result-count" aria-live="polite">{plural(count, 'chamado', 'chamados')}</span>
      {active && (
        <button type="button" className="button button-ghost" onClick={() => onChange(EMPTY_FILTERS)}>
          <FilterX size={16} /> Limpar
        </button>
      )}
    </div>
  );
}
