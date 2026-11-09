import { useMemo } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import type { Filters, Ticket } from '../types';
import { countByPriority, countByStatus, dailyActivity } from '../lib/tickets';
import { useCountUp } from '../hooks/useAnimation';
import { STATUS_ICON } from './icons';
import { ActivityChart, PriorityBars, RecentActivity, StatusDonut } from './Charts';

interface MetricProps {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  tone: string;
  onClick: () => void;
}

function MetricCard({ label, value, note, icon: Icon, tone, onClick }: MetricProps) {
  const shown = useCountUp(value);
  return (
    <button type="button" className={`metric tone-${tone}`} onClick={onClick} aria-label={`${label}: ${value}. Ver na lista.`}>
      <span className="metric-top">{label}<span className="metric-icon"><Icon size={20} /></span></span>
      <span className="metric-value">{shown}</span>
      <span className="metric-note">{note}</span>
    </button>
  );
}

interface Props {
  tickets: Ticket[];
  onOpen: (id: number) => void;
  onFilter: (filters: Partial<Filters>) => void;
}

export function Dashboard({ tickets, onOpen, onFilter }: Props) {
  const status = countByStatus(tickets);
  const priority = countByPriority(tickets);
  const activity = useMemo(() => dailyActivity(tickets), [tickets]);
  const resolvedRate = tickets.length ? Math.round((status.Resolvido / tickets.length) * 100) : 0;

  return (
    <>
      <section className="metrics" aria-label="Indicadores">
        <MetricCard label="Total de chamados" value={tickets.length} note="Registrados na plataforma" icon={Inbox} tone="total" onClick={() => onFilter({})} />
        <MetricCard label="Em aberto" value={status.Aberto} note="Aguardando atendimento" icon={STATUS_ICON.Aberto} tone="aberto" onClick={() => onFilter({ status: 'Aberto' })} />
        <MetricCard label="Em andamento" value={status['Em andamento']} note="Sendo atendidos agora" icon={STATUS_ICON['Em andamento']} tone="em-andamento" onClick={() => onFilter({ status: 'Em andamento' })} />
        <MetricCard label="Resolvidos" value={status.Resolvido} note={`${resolvedRate}% do total`} icon={STATUS_ICON.Resolvido} tone="resolvido" onClick={() => onFilter({ status: 'Resolvido' })} />
      </section>

      <section className="charts-grid" aria-label="Gráficos">
        <article className="card span-8">
          <h2>Últimos 7 dias</h2>
          <p className="card-sub">Chamados abertos e resolvidos por dia.</p>
          <ActivityChart data={activity} />
        </article>
        <article className="card span-4">
          <h2>Por status</h2>
          <p className="card-sub">Clique numa cor para ver os chamados.</p>
          <StatusDonut counts={status} onSelect={(value) => onFilter({ status: value })} />
        </article>
        <article className="card span-5">
          <h2>Por prioridade</h2>
          <p className="card-sub">Quantos chamados há em cada nível.</p>
          <PriorityBars counts={priority} onSelect={(value) => onFilter({ priority: value })} />
        </article>
        <article className="card span-7">
          <h2>Atividade recente</h2>
          <p className="card-sub">O que mudou por último. Clique para abrir o chamado.</p>
          <RecentActivity tickets={tickets} onOpen={onOpen} />
        </article>
      </section>
    </>
  );
}
