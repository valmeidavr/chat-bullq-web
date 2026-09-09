'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

const OPTIONS = [
  { key: 'light', icon: Sun, label: 'Claro' },
  { key: 'system', icon: Monitor, label: 'Sistema' },
  { key: 'dark', icon: Moon, label: 'Escuro' },
] as const;

/** Seletor de tema (claro/sistema/escuro) para a sidebar. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Evita mismatch de hidratação: reserva o espaço até montar.
  if (!mounted) {
    return <div className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-700" />;
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
      {OPTIONS.map((o) => {
        const active = theme === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => setTheme(o.key)}
            title={o.label}
            aria-label={`Tema ${o.label}`}
            aria-pressed={active}
            className={`flex flex-1 items-center justify-center rounded-md py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }`}
          >
            <o.icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
