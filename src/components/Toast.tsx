import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}
interface ToastState {
  id: number;
  message: string;
  action?: ToastAction;
}
type ShowToast = (message: string, action?: ToastAction) => void;

const ToastContext = createContext<ShowToast>(() => {});

const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

// O aviso é um "popover": vai para a camada de cima da página e aparece
// por cima até de um modal aberto. Navegador antigo cai no modo normal.
// O atributo vai pelo DOM porque os tipos do React 18 ainda não conhecem "popover".
function setPopoverOpen(element: HTMLElement | null, open: boolean) {
  if (!element || !supportsPopover) return;
  if (!element.hasAttribute('popover')) element.setAttribute('popover', 'manual');
  const isOpen = element.matches(':popover-open');
  if (isOpen) element.hidePopover();
  if (open) element.showPopover();
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const show = useCallback<ShowToast>((message, action) => setToast({ id: Date.now(), message, action }), []);

  useEffect(() => {
    setPopoverOpen(ref.current, toast !== null);
    if (!toast) return;
    // Aviso com "Desfazer" fica mais tempo na tela, para dar tempo de clicar.
    const timer = window.setTimeout(() => setToast(null), toast.action ? 6000 : 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div ref={ref} className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <span>{toast.message}</span>
            {toast.action && (
              <button type="button" onClick={() => { toast.action?.onClick(); setToast(null); }}>
                {toast.action.label}
              </button>
            )}
          </>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
