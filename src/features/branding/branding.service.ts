import { api } from '@/lib/api';

export interface OrgBranding {
  logoUrl: string | null;
  primaryColor: string | null;
}

export const brandingService = {
  async get(): Promise<OrgBranding> {
    const { data } = await api.get('/organizations/current');
    const org = data.data ?? data;
    const primaryColor =
      (org?.settings?.branding?.primaryColor as string | undefined) ?? null;
    return { logoUrl: org?.logoUrl ?? null, primaryColor };
  },

  async update(input: {
    logoUrl?: string | null;
    primaryColor?: string;
  }): Promise<void> {
    await api.patch('/organizations/current', input);
  },
};
