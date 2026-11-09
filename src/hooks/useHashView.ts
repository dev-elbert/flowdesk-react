import { useEffect, useState } from 'react';
import type { View } from '../types';

// Rotas pelo "#" da URL (#/painel, #/lista, #/quadro): funcionam no GitHub Pages
// sem configurar servidor, e o botão "voltar" do navegador continua funcionando.
const VIEWS: readonly string[] = ['painel', 'lista', 'quadro'];

function readView(): View {
  const value = window.location.hash.replace(/^#\/?/, '');
  return VIEWS.includes(value) ? (value as View) : 'painel';
}

export function navigate(view: View): void {
  window.location.hash = `/${view}`;
}

export function useHashView(): View {
  const [view, setView] = useState(readView);
  useEffect(() => {
    const onChange = () => {
      setView(readView());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return view;
}
