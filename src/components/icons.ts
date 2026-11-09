import {
  ArrowDown, ArrowRight, ArrowRightLeft, ArrowUp, CircleCheck, CircleDashed, CirclePlus, Clock,
  Flag, MessageSquare, Pencil, UserRound, type LucideIcon,
} from 'lucide-react';
import type { HistoryEvent, Priority, Status } from '../types';

export const STATUS_ICON: Record<Status, LucideIcon> = {
  Aberto: CircleDashed,
  'Em andamento': Clock,
  Resolvido: CircleCheck,
};

export const PRIORITY_ICON: Record<Priority, LucideIcon> = {
  Alta: ArrowUp,
  Média: ArrowRight,
  Baixa: ArrowDown,
};

export const EVENT_ICON: Record<HistoryEvent['type'], LucideIcon> = {
  created: CirclePlus,
  edited: Pencil,
  status: ArrowRightLeft,
  priority: Flag,
  owner: UserRound,
  comment: MessageSquare,
};
