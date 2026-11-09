import { FileDown, Plus, RotateCcw } from 'lucide-react';
import type { View } from '../types';

const HEADINGS: Record<View, { eyebrow: string; title: string; muted: string; text: string }> = {
  painel: {
    eyebrow: 'CENTRAL DE OPERAÇÕES',
    title: 'Visão geral',
    muted: 'dos chamados',
    text: 'Acompanhe os números e o que mudou nos últimos dias.',
  },
  lista: {
    eyebrow: 'FILA DE ATENDIMENTO',
    title: 'Chamados',
    muted: 'em lista',
    text: 'Busque, filtre e ordene. Clique num chamado para ver os detalhes.',
  },
  quadro: {
    eyebrow: 'FLUXO DE TRABALHO',
    title: 'Quadro',
    muted: 'kanban',
    text: 'Arraste os cartões entre as colunas para mudar o status. No celular, segure o cartão antes de arrastar.',
  },
};

interface Props {
  view: View;
  onNew: () => void;
  onExport: () => void;
  onReset: () => void;
}

export function PageHeader({ view, onNew, onExport, onReset }: Props) {
  const heading = HEADINGS[view];
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{heading.eyebrow}</div>
        <h1>{heading.title} <span className="h1-muted">{heading.muted}</span></h1>
        <p>{heading.text}</p>
      </div>
      <div className="header-actions">
        <button type="button" className="button button-secondary" onClick={onReset} aria-label="Restaurar demonstração" title="Restaurar os dados de demonstração">
          <RotateCcw size={16} /><span className="hide-mobile">Restaurar demo</span>
        </button>
        <button type="button" className="button button-secondary" onClick={onExport} aria-label="Exportar CSV" title="Exportar os chamados filtrados em CSV">
          <FileDown size={16} /><span className="hide-mobile">Exportar CSV</span>
        </button>
        <button type="button" className="button button-primary hide-mobile" onClick={onNew}>
          <Plus size={17} /> Novo chamado <kbd>N</kbd>
        </button>
      </div>
    </header>
  );
}
