import { FilterX, Inbox, SearchX } from 'lucide-react';

export function EmptyState({ hasTickets, onClearFilters }: { hasTickets: boolean; onClearFilters: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{hasTickets ? <SearchX size={26} /> : <Inbox size={26} />}</span>
      <h3>{hasTickets ? 'Nenhum chamado encontrado' : 'Nenhum chamado cadastrado'}</h3>
      <p>{hasTickets ? 'Tente outra busca ou limpe os filtros.' : 'Clique em "Novo chamado" para começar.'}</p>
      {hasTickets && (
        <button type="button" className="button button-secondary" onClick={onClearFilters}>
          <FilterX size={16} /> Limpar filtros
        </button>
      )}
    </div>
  );
}
