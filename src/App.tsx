import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Filters, Status, Ticket, TicketDraft } from './types';
import { EMPTY_FILTERS, filterTickets, knownOwners } from './lib/tickets';
import { downloadCsv, ticketsToCsv } from './lib/csv';
import { plural } from './lib/format';
import { useTickets } from './hooks/useTickets';
import { navigate, useHashView } from './hooks/useHashView';
import { useTheme } from './hooks/useTheme';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useToast } from './components/Toast';
import { BottomNav, MobileTopBar, Sidebar } from './components/Navigation';
import { PageHeader } from './components/PageHeader';
import { Dashboard } from './components/Dashboard';
import { FiltersBar } from './components/FiltersBar';
import { TicketList } from './components/TicketList';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketDialog } from './components/TicketDialog';
import { TicketDrawer } from './components/TicketDrawer';

export default function App() {
  const toast = useToast();
  const store = useTickets(() => toast('Armazenamento indisponível: as alterações valem só nesta sessão.'));
  const { tickets } = store;
  const view = useHashView();
  const { theme, toggleTheme } = useTheme();
  const install = useInstallPrompt();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [editing, setEditing] = useState<{ ticket: Ticket | null } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // No quadro as colunas já separam por status, então esse filtro não se aplica lá.
  const visible = useMemo(
    () => filterTickets(tickets, view === 'quadro' ? { ...filters, status: 'todos' } : filters),
    [tickets, filters, view],
  );
  const owners = useMemo(() => knownOwners(tickets), [tickets]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const pendingCount = tickets.filter((ticket) => ticket.status !== 'Resolvido').length;

  const openNew = () => setEditing({ ticket: null });

  function showFiltered(partial: Partial<Filters>) {
    setFilters({ ...EMPTY_FILTERS, ...partial });
    navigate('lista');
  }

  function handleSave(draft: TicketDraft) {
    if (editing?.ticket) {
      store.update(editing.ticket.id, draft);
      toast('Chamado atualizado.');
    } else {
      const id = store.create(draft);
      toast(`Chamado #${id} criado.`, { label: 'Abrir', onClick: () => setSelectedId(id) });
    }
    setEditing(null);
  }

  // Sem "tem certeza?": exclui na hora e oferece desfazer, que é mais rápido para quem usa.
  function handleDelete(ticket: Ticket) {
    store.remove(ticket.id);
    setSelectedId(null);
    toast(`Chamado #${ticket.id} excluído.`, { label: 'Desfazer', onClick: () => store.restore(ticket) });
  }

  function handleStatus(id: number, status: Status) {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket || ticket.status === status) return;
    store.setStatus(id, status);
    toast(`#${id} movido para ${status}.`, { label: 'Desfazer', onClick: () => store.setStatus(id, ticket.status) });
  }

  function handleExport() {
    if (visible.length === 0) {
      toast('Nenhum chamado para exportar.');
      return;
    }
    downloadCsv(ticketsToCsv(visible), `flowdesk-chamados-${new Date().toISOString().slice(0, 10)}.csv`);
    toast(`${plural(visible.length, 'chamado exportado', 'chamados exportados')}.`);
  }

  function handleReset() {
    if (!window.confirm('Restaurar os exemplos? Todos os chamados adicionados ou alterados serão perdidos.')) return;
    store.reset();
    setFilters(EMPTY_FILTERS);
    setSelectedId(null);
    toast('Dados de demonstração restaurados.');
  }

  // Atalhos: N abre um chamado novo, / vai para a busca.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]')) return;
      if ((event.target as Element | null)?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        setEditing({ ticket: null });
      } else if (event.key === '/') {
        event.preventDefault();
        if (!['#/lista', '#/quadro'].includes(window.location.hash)) navigate('lista');
        window.setTimeout(() => searchRef.current?.focus(), 60);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtersBar = (showStatus: boolean) => (
    <FiltersBar filters={filters} onChange={setFilters} showStatus={showStatus} count={visible.length} searchRef={searchRef} />
  );

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#conteudo"
        onClick={(event) => { event.preventDefault(); document.getElementById('conteudo')?.focus(); }}
      >
        Pular para o conteúdo
      </a>
      <Sidebar view={view} openCount={pendingCount} theme={theme} onToggleTheme={toggleTheme} onInstall={install} />

      <div className="main-area">
        <MobileTopBar theme={theme} onToggleTheme={toggleTheme} onInstall={install} />
        <main id="conteudo" className="main-content" tabIndex={-1}>
          <PageHeader view={view} onNew={openNew} onExport={handleExport} onReset={handleReset} />

          <div key={view} className="view">
            {view === 'painel' && <Dashboard tickets={tickets} onOpen={setSelectedId} onFilter={showFiltered} />}

            {view === 'lista' && (
              <section className="panel" aria-label="Lista de chamados">
                {filtersBar(true)}
                <TicketList
                  tickets={visible}
                  hasTickets={tickets.length > 0}
                  onOpen={setSelectedId}
                  onEdit={(ticket) => setEditing({ ticket })}
                  onDelete={handleDelete}
                  onClearFilters={() => setFilters(EMPTY_FILTERS)}
                />
              </section>
            )}

            {view === 'quadro' && (
              <>
                <section className="panel toolbar" aria-label="Filtros do quadro">{filtersBar(false)}</section>
                <KanbanBoard tickets={visible} onOpen={setSelectedId} onMove={handleStatus} />
              </>
            )}
          </div>

          <footer className="footer">
            <span><strong>FlowDesk 2.0</strong> · React + TypeScript · dados salvos só neste navegador</span>
            <span className="hide-mobile">Atalhos: <kbd>N</kbd> novo chamado · <kbd>/</kbd> buscar</span>
            <a href="https://github.com/dev-elbert/flowdesk-react" target="_blank" rel="noreferrer">Código no GitHub</a>
          </footer>
        </main>
      </div>

      <BottomNav view={view} openCount={pendingCount} />
      <button type="button" className="fab" onClick={openNew} aria-label="Novo chamado"><Plus size={26} /></button>

      {editing && (
        <TicketDialog ticket={editing.ticket} owners={owners} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
      {selected && (
        <TicketDrawer
          key={selected.id}
          ticket={selected}
          onClose={() => setSelectedId(null)}
          onEdit={(ticket) => setEditing({ ticket })}
          onDelete={handleDelete}
          onStatus={handleStatus}
          onComment={store.comment}
        />
      )}
    </div>
  );
}
