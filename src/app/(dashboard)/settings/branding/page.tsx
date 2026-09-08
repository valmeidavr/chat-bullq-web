'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Palette } from 'lucide-react';
import { brandingService } from '@/features/branding/branding.service';
import { useAuthStore } from '@/stores/auth-store';

const MAX_LOGO_BYTES = 200 * 1024; // 200KB (vira data URL no banco)
const DEFAULT_COLOR = '#4f46e5';
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export default function SettingsBrandingPage() {
  const { activeOrgId, setOrgBranding, organizations } = useAuthStore();
  const activeOrg = organizations.find((o) => o.id === activeOrgId);

  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    brandingService
      .get()
      .then((b) => {
        if (b.primaryColor && HEX_RE.test(b.primaryColor)) setColor(b.primaryColor);
        setLogo(b.logoUrl ?? null);
      })
      .catch(() => toast.error('Falha ao carregar a marca'))
      .finally(() => setLoading(false));
  }, []);

  const onPickLogo = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem (PNG, JPG, SVG, WEBP).');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Logo muito grande. Máximo 200KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.onerror = () => toast.error('Não consegui ler a imagem.');
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!HEX_RE.test(color)) {
      toast.error('Cor inválida. Use um hex como #4f46e5.');
      return;
    }
    setSaving(true);
    try {
      await brandingService.update({ primaryColor: color, logoUrl: logo });
      if (activeOrgId)
        setOrgBranding(activeOrgId, { primaryColor: color, logoUrl: logo });
      toast.success('Marca salva! As mudanças já estão aplicadas.');
    } catch {
      toast.error('Falha ao salvar a marca.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-1 flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Marca (White-label)
        </h2>
      </div>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Personalize a cor e o logo que aparecem no painel para toda a sua
        organização.
      </p>

      {/* Cor primária */}
      <section className="mb-8">
        <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Cor primária
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={HEX_RE.test(color) ? (color.length === 4 ? color : color) : DEFAULT_COLOR}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Selecionar cor primária"
            className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-1 dark:border-zinc-700"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value.trim())}
            placeholder={DEFAULT_COLOR}
            className="w-32 rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={() => setColor(DEFAULT_COLOR)}
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Restaurar padrão
          </button>
        </div>
      </section>

      {/* Logo */}
      <section className="mb-8">
        <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Logo (aparece no menu lateral)
        </label>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-zinc-400">sem logo</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickLogo(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <Upload className="h-4 w-4" /> Enviar logo
            </button>
            {logo && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            )}
            <span className="text-xs text-zinc-400">PNG, JPG, SVG ou WEBP · até 200KB</span>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="mb-8">
        <span className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Prévia
        </span>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo" className="h-6 w-6 rounded object-contain" />
            ) : (
              <span
                className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ background: HEX_RE.test(color) ? color : DEFAULT_COLOR }}
              >
                {activeOrg?.name?.slice(0, 2).toUpperCase() ?? 'OR'}
              </span>
            )}
            <span className="text-sm font-medium">{activeOrg?.name ?? 'Sua Org'}</span>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: HEX_RE.test(color) ? color : DEFAULT_COLOR }}
          >
            Botão de exemplo
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Salvando…' : 'Salvar marca'}
      </button>
    </div>
  );
}
