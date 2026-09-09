'use client';

import { NODE_ICONS, NODE_COLORS } from './nodes/node-icons';

const nodeTemplates: { type: string; label: string }[] = [
  { type: 'MESSAGE', label: 'Mensagem' },
  { type: 'MENU', label: 'Menu' },
  { type: 'QUESTION', label: 'Pergunta' },
  { type: 'CONDITION', label: 'Condição' },
  { type: 'HTTP_REQUEST', label: 'Requisição API' },
  { type: 'AI', label: 'IA' },
  { type: 'HANDOFF_AI', label: 'Assumir com IA' },
  { type: 'OTP_REQUEST', label: 'Enviar código' },
  { type: 'OTP_VERIFY', label: 'Validar código' },
  { type: 'PORTAL_ACTION', label: 'Ação no portal' },
  { type: 'TRANSFER', label: 'Transferir' },
  { type: 'END_FLOW', label: 'Fim' },
];

interface NodeToolbarProps {
  onAddNode: (type: string) => void;
}

export function NodeToolbar({ onAddNode }: NodeToolbarProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
      <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Nós</p>
      {nodeTemplates.map((t) => {
        const Icon = NODE_ICONS[t.type];
        return (
          <button
            key={t.type}
            type="button"
            onClick={() => onAddNode(t.type)}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${NODE_COLORS[t.type]}`}>
              <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.25} aria-hidden="true" />
            </span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
