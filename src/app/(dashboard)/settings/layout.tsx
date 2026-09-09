'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, Users, Tags, Bell, Building2, KeyRound, Sparkles, BookUser, Layers, Palette, MessageSquareText } from 'lucide-react';

const tabs = [
  { href: '/settings/channels', label: 'Canais', icon: Radio },
  { href: '/settings/templates', label: 'Templates', icon: MessageSquareText },
  { href: '/settings/segments', label: 'Segmentos', icon: Layers },
  { href: '/settings/general', label: 'Geral', icon: Building2 },
  { href: '/settings/branding', label: 'Marca', icon: Palette },
  { href: '/settings/ai', label: 'IA', icon: Sparkles },
  { href: '/settings/members', label: 'Membros', icon: Users },
  { href: '/settings/contacts', label: 'Contatos', icon: BookUser },
  { href: '/settings/tags', label: 'Tags', icon: Tags },
  { href: '/settings/notifications', label: 'Notificações', icon: Bell },
  { href: '/settings/api-keys', label: 'API Keys', icon: KeyRound },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Configurações</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Gerencie sua organização e integrações
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
