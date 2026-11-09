import { useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'flowdesk_theme';
const THEME_COLOR: Record<Theme, string> = { dark: '#0b1220', light: '#f3f6fb' };

function readChoice(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

/** Segue o tema do sistema até a pessoa escolher um. A escolha fica salva. */
export function useTheme() {
  const [choice, setChoice] = useState<Theme | null>(readChoice);
  const systemLight = useMediaQuery('(prefers-color-scheme: light)');
  const theme: Theme = choice ?? (systemLight ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setChoice(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Sem armazenamento: a escolha vale só nesta sessão.
    }
  }

  return { theme, toggleTheme };
}
