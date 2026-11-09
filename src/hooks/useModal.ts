import { useEffect, type MouseEvent, type RefObject } from 'react';

/**
 * Abre o <dialog> como modal assim que o componente aparece. O navegador cuida do
 * foco, da tecla Esc e do fundo escurecido. Fechar = o componente pai desmontar.
 */
export function useModal(ref: RefObject<HTMLDialogElement>, focusSelector?: string): void {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    if (focusSelector) dialog.querySelector<HTMLElement>(focusSelector)?.focus();
  }, [ref, focusSelector]);
}

/** Fecha ao clicar no fundo escuro, fora do conteúdo do modal. */
export const closeOnBackdrop = (onClose: () => void) => (event: MouseEvent<HTMLDialogElement>) => {
  if (event.target === event.currentTarget) onClose();
};
