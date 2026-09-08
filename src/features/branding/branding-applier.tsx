'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Escolhe preto/branco pra ficar legível sobre a cor da marca (WCAG-ish). */
function readableForeground(hex: string): string {
  const m = hex.replace('#', '');
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m;
  if (full.length !== 6) return '#ffffff';
  const chan = (i: number) => parseInt(full.slice(i, i + 2), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L =
    0.2126 * lin(chan(0)) + 0.7152 * lin(chan(2)) + 0.0722 * lin(chan(4));
  return L > 0.5 ? '#111827' : '#ffffff';
}

/**
 * White-label: aplica a cor primária da org ativa sobrescrevendo as CSS vars
 * no <html> (inline vence tanto o tema light quanto o .dark). Renderiza null.
 */
export function BrandingApplier() {
  const { organizations, activeOrgId } = useAuthStore();
  const color =
    organizations.find((o) => o.id === activeOrgId)?.primaryColor || null;

  useEffect(() => {
    const root = document.documentElement;
    const vars = ['--color-primary', '--color-ring', '--color-primary-foreground'];
    if (color && HEX_RE.test(color)) {
      root.style.setProperty('--color-primary', color);
      root.style.setProperty('--color-ring', color);
      root.style.setProperty('--color-primary-foreground', readableForeground(color));
    } else {
      vars.forEach((v) => root.style.removeProperty(v));
    }
    return () => vars.forEach((v) => root.style.removeProperty(v));
  }, [color]);

  return null;
}
