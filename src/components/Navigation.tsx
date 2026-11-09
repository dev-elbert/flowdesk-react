import { Download, LayoutDashboard, ListTodo, Moon, SquareKanban, Sun, type LucideIcon } from 'lucide-react';
import type { View } from '../types';
import type { Theme } from '../hooks/useTheme';
import { Logo } from './Badges';

const NAV: { view: View; label: string; icon: LucideIcon }[] = [
  { view: 'painel', label: 'Painel', icon: LayoutDashboard },
  { view: 'lista', label: 'Chamados', icon: ListTodo },
  { view: 'quadro', label: 'Quadro', icon: SquareKanban },
];

interface AppControls {
  theme: Theme;
  onToggleTheme: () => void;
  onInstall: (() => void) | null;
}

function ThemeToggle({ theme, onToggleTheme, withLabel = false }: Omit<AppControls, 'onInstall'> & { withLabel?: boolean }) {
  const next = theme === 'dark' ? 'claro' : 'escuro';
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button
      type="button"
      className={withLabel ? 'button button-ghost button-block theme-toggle' : 'icon-button'}
      onClick={onToggleTheme}
      aria-label={`Ativar tema ${next}`}
      title={`Tema ${next}`}
    >
      <Icon size={18} className="theme-icon" />
      {withLabel && `Tema ${next}`}
    </button>
  );
}

function OpenBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return <span className="nav-badge">{count}<span className="visually-hidden"> pendentes</span></span>;
}

export function Sidebar({ view, openCount, theme, onToggleTheme, onInstall }: AppControls & { view: View; openCount: number }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#/painel" aria-label="FlowDesk, ir para o painel">
        <Logo />
        <span>Flow<span className="brand-accent">Desk</span><small>SUPPORT WORKSPACE</small></span>
      </a>
      <div className="sidebar-label">WORKSPACE</div>
      <nav aria-label="Navegação principal">
        {NAV.map(({ view: target, label, icon: Icon }) => (
          <a key={target} href={`#/${target}`} className={`nav-item ${view === target ? 'active' : ''}`} aria-current={view === target ? 'page' : undefined}>
            <Icon size={19} />
            {label}
            {target === 'lista' && <OpenBadge count={openCount} />}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {onInstall && (
          <button type="button" className="button button-secondary button-block" onClick={onInstall}>
            <Download size={16} /> Instalar app
          </button>
        )}
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} withLabel />
        <div className="sidebar-status">
          <span className="online-dot" aria-hidden="true" />Ambiente de demonstração
          <small>Dados salvos neste navegador</small>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar({ theme, onToggleTheme, onInstall }: AppControls) {
  return (
    <header className="mobile-topbar">
      <a className="brand" href="#/painel" aria-label="FlowDesk, ir para o painel">
        <Logo />
        <span>Flow<span className="brand-accent">Desk</span></span>
      </a>
      {onInstall && (
        <button type="button" className="icon-button" onClick={onInstall} aria-label="Instalar app" title="Instalar app">
          <Download size={20} />
        </button>
      )}
      <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
    </header>
  );
}

export function BottomNav({ view, openCount }: { view: View; openCount: number }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {NAV.map(({ view: target, label, icon: Icon }) => (
        <a key={target} href={`#/${target}`} className={view === target ? 'active' : ''} aria-current={view === target ? 'page' : undefined}>
          <Icon size={22} />
          {label}
          {target === 'lista' && <OpenBadge count={openCount} />}
        </a>
      ))}
    </nav>
  );
}
