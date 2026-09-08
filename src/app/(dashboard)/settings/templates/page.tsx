'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw, Trash2, X, MessageSquareText } from 'lucide-react';
import {
  templatesService,
  type MessageTemplate,
  type TemplateStatus,
  type TemplateButton,
} from '@/features/templates/templates.service';

const STATUS_STYLES: Record<TemplateStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Rascunho', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
  PENDING: { label: 'Em análise', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  APPROVED: { label: 'Aprovado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  REJECTED: { label: 'Rejeitado', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  PAUSED: { label: 'Pausado', cls: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200' },
};

const inputCls =
  'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-900';

export default function SettingsTemplatesPage() {
  const [items, setItems] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('pt_BR');
  const [category, setCategory] = useState('UTILITY');
  const [body, setBody] = useState('');
  const [buttons, setButtons] = useState<TemplateButton[]>([]);

  const load = () =>
    templatesService
      .list()
      .then(setItems)
      .catch(() => toast.error('Falha ao carregar templates'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName('');
    setLanguage('pt_BR');
    setCategory('UTILITY');
    setBody('');
    setButtons([]);
    setShowForm(false);
  };

  const addButton = () =>
    setButtons((b) => [...b, { type: 'QUICK_REPLY', text: '' }]);
  const updateButton = (i: number, patch: Partial<TemplateButton>) =>
    setButtons((b) => b.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeButton = (i: number) =>
    setButtons((b) => b.filter((_, idx) => idx !== i));

  const create = async () => {
    if (!name.trim() || !body.trim()) {
      toast.error('Preencha nome e corpo do template.');
      return;
    }
    setSaving(true);
    try {
      await templatesService.create({
        name: name.trim(),
        language,
        category,
        body,
        buttons: buttons.filter((b) => b.text.trim()),
      });
      toast.success('Template enviado para aprovação!');
      resetForm();
      setLoading(true);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao criar template');
    } finally {
      setSaving(false);
    }
  };

  const sync = async (id: string) => {
    setSyncing(id);
    try {
      const updated = await templatesService.sync(id);
      setItems((arr) => arr.map((t) => (t.id === id ? updated : t)));
      toast.success('Status atualizado.');
    } catch {
      toast.error('Falha ao atualizar status.');
    } finally {
      setSyncing(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este template?')) return;
    try {
      await templatesService.remove(id);
      setItems((arr) => arr.filter((t) => t.id !== id));
      toast.success('Template removido.');
    } catch {
      toast.error('Falha ao remover.');
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Templates (WhatsApp)
          </h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Novo template
          </button>
        )}
      </div>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Crie templates HSM e acompanhe a aprovação. Requer um canal WhatsApp
        (Twilio) configurado.
      </p>

      {showForm && (
        <div className="mb-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Novo template</h3>
            <button onClick={resetForm} className="text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Nome</span>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="boas_vindas" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Idioma</span>
                <input className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="pt_BR" />
              </label>
            </div>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Categoria</span>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="UTILITY">Utility (transacional)</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication (código)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-700 dark:text-zinc-300">
                Corpo <span className="text-zinc-400">— use {'{{1}}'}, {'{{2}}'} para variáveis</span>
              </span>
              <textarea className={inputCls} rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Olá {{1}}, seu pedido {{2}} foi confirmado." />
            </label>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">Botões (opcional)</span>
                <button onClick={addButton} className="text-primary hover:underline">+ adicionar botão</button>
              </div>
              <div className="space-y-2">
                {buttons.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select className={`${inputCls} w-40`} value={b.type} onChange={(e) => updateButton(i, { type: e.target.value as TemplateButton['type'] })}>
                      <option value="QUICK_REPLY">Resposta rápida</option>
                      <option value="URL">Link (URL)</option>
                      <option value="PHONE_NUMBER">Telefone</option>
                    </select>
                    <input className={inputCls} placeholder="Texto do botão" value={b.text} onChange={(e) => updateButton(i, { text: e.target.value })} />
                    {b.type === 'URL' && (
                      <input className={inputCls} placeholder="https://..." value={b.url ?? ''} onChange={(e) => updateButton(i, { url: e.target.value })} />
                    )}
                    {b.type === 'PHONE_NUMBER' && (
                      <input className={inputCls} placeholder="+5511..." value={b.phone ?? ''} onChange={(e) => updateButton(i, { phone: e.target.value })} />
                    )}
                    <button onClick={() => removeButton(i)} className="shrink-0 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={resetForm} className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                Cancelar
              </button>
              <button onClick={create} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {saving ? 'Enviando…' : 'Enviar para aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Nenhum template ainda. Clique em “Novo template”.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => {
            const st = STATUS_STYLES[t.status];
            return (
              <div key={t.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                      <span className="text-xs text-zinc-400">{t.language} · {t.category}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">{t.body}</p>
                    {t.buttons && t.buttons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {t.buttons.map((b, i) => (
                          <span key={i} className="rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700">{b.text}</span>
                        ))}
                      </div>
                    )}
                    {t.status === 'REJECTED' && t.rejectionReason && (
                      <p className="mt-2 text-xs text-red-500">Motivo: {t.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => sync(t.id)} disabled={syncing === t.id} title="Atualizar status" className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800">
                      <RefreshCw className={`h-4 w-4 ${syncing === t.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => remove(t.id)} title="Remover" className="rounded-md p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
