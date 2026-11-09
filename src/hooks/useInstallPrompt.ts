import { useEffect, useState } from 'react';

// Evento que Chrome, Edge e Android disparam quando o site pode ser instalado.
// Não existe no Safari: no iPhone, instala-se pelo menu Compartilhar.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Devolve a função que abre o "Instalar app", ou null quando não dá para instalar. */
export function useInstallPrompt(): (() => void) | null {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!promptEvent) return null;
  return () => {
    void promptEvent.prompt();
    void promptEvent.userChoice.then(() => setPromptEvent(null));
  };
}
