import {
  Play,
  MessageSquare,
  ListChecks,
  HelpCircle,
  GitBranch,
  Clock,
  Globe,
  Sparkles,
  Bot,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  ArrowRightLeft,
  Flag,
  type LucideIcon,
} from 'lucide-react';

/**
 * Fonte única dos ícones dos nós do fluxo (toolbar + canvas). SVG (Lucide),
 * viewBox 24, tamanho fixo — sem emoji, pra ficar consistente e profissional.
 */
export const NODE_ICONS: Record<string, LucideIcon> = {
  START: Play,
  MESSAGE: MessageSquare,
  MENU: ListChecks,
  QUESTION: HelpCircle,
  CONDITION: GitBranch,
  WAIT: Clock,
  HTTP_REQUEST: Globe,
  AI: Sparkles,
  HANDOFF_AI: Bot,
  OTP_REQUEST: KeyRound,
  OTP_VERIFY: ShieldCheck,
  PORTAL_ACTION: Stethoscope,
  TRANSFER: ArrowRightLeft,
  END_FLOW: Flag,
};

/** Cor do cabeçalho de cada nó (Tailwind bg-*). */
export const NODE_COLORS: Record<string, string> = {
  START: 'bg-emerald-500',
  MESSAGE: 'bg-blue-500',
  MENU: 'bg-violet-500',
  QUESTION: 'bg-cyan-500',
  CONDITION: 'bg-amber-500',
  WAIT: 'bg-cyan-500',
  HTTP_REQUEST: 'bg-teal-500',
  AI: 'bg-fuchsia-500',
  HANDOFF_AI: 'bg-indigo-500',
  OTP_REQUEST: 'bg-emerald-600',
  OTP_VERIFY: 'bg-emerald-500',
  PORTAL_ACTION: 'bg-sky-600',
  TRANSFER: 'bg-rose-500',
  END_FLOW: 'bg-zinc-500',
};
