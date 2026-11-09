import { useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { PRIORITIES, STATUSES, type Ticket, type TicketDraft } from '../types';
import { EMPTY_DRAFT, LIMITS, toDraft } from '../lib/tickets';
import { safeClass } from '../lib/format';
import { closeOnBackdrop, useModal } from '../hooks/useModal';
import { PRIORITY_ICON, STATUS_ICON } from './icons';

interface Props {
  ticket: Ticket | null;
  owners: string[];
  onClose: () => void;
  onSave: (draft: TicketDraft) => void;
}

export function TicketDialog({ ticket, owners, onClose, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useModal(ref, '#titleInput');
  const [draft, setDraft] = useState<TicketDraft>(() => (ticket ? toDraft(ticket) : EMPTY_DRAFT));
  const set = <K extends keyof TicketDraft>(key: K, value: TicketDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean: TicketDraft = {
      ...draft,
      title: draft.title.trim(),
      client: draft.client.trim(),
      owner: draft.owner.trim(),
      description: draft.description.trim(),
    };
    if (!clean.title || !clean.client) return;
    onSave(clean);
  }

  return (
    <dialog ref={ref} className="modal" aria-labelledby="dialogTitle" onClose={onClose} onClick={closeOnBackdrop(onClose)}>
      <form className="ticket-form" onSubmit={submit}>
        <span className="sheet-handle" aria-hidden="true" />
        <div className="dialog-heading">
          <div>
            <div className="eyebrow">ATENDIMENTO</div>
            <h2 id="dialogTitle">{ticket ? `Editar chamado #${ticket.id}` : 'Novo chamado'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>

        <label className="field">
          Título do chamado
          <input id="titleInput" required maxLength={LIMITS.title} value={draft.title} onChange={(event) => set('title', event.target.value)} placeholder="Ex.: Falha ao emitir relatório" />
        </label>

        <div className="form-grid">
          <label className="field">
            Cliente
            <input required maxLength={LIMITS.client} value={draft.client} onChange={(event) => set('client', event.target.value)} placeholder="Ex.: Empresa Aurora" />
          </label>
          <label className="field">
            Responsável
            <input list="owner-options" maxLength={LIMITS.owner} value={draft.owner} onChange={(event) => set('owner', event.target.value)} placeholder="Ex.: Ana Souza" />
            <datalist id="owner-options">
              {owners.map((owner) => <option key={owner} value={owner} />)}
            </datalist>
          </label>
        </div>

        <fieldset className="field">
          <legend>Prioridade</legend>
          <div className="segmented">
            {PRIORITIES.map((priority) => {
              const Icon = PRIORITY_ICON[priority];
              const checked = draft.priority === priority;
              return (
                <label key={priority} className={`segment tone-${safeClass(priority)} ${checked ? 'checked' : ''}`}>
                  <input type="radio" name="priority" value={priority} checked={checked} onChange={() => set('priority', priority)} />
                  <Icon size={16} strokeWidth={2.5} />{priority}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Status</legend>
          <div className="segmented">
            {STATUSES.map((status) => {
              const Icon = STATUS_ICON[status];
              const checked = draft.status === status;
              return (
                <label key={status} className={`segment tone-${safeClass(status)} ${checked ? 'checked' : ''}`}>
                  <input type="radio" name="status" value={status} checked={checked} onChange={() => set('status', status)} />
                  <Icon size={16} />{status}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="field">
          Descrição
          <textarea rows={4} maxLength={LIMITS.description} value={draft.description} onChange={(event) => set('description', event.target.value)} placeholder="Descreva a solicitação (opcional)" />
          <span className="char-count">{draft.description.length}/{LIMITS.description}</span>
        </label>

        <div className="dialog-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="button button-primary">{ticket ? 'Salvar alterações' : 'Criar chamado'}</button>
        </div>
      </form>
    </dialog>
  );
}
