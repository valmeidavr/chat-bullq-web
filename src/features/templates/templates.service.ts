import { api } from '@/lib/api';

export type TemplateStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  body: string;
  variablesCount: number;
  buttons?: TemplateButton[] | null;
  status: TemplateStatus;
  rejectionReason?: string | null;
  providerSid?: string | null;
  createdAt: string;
}

export interface CreateTemplateInput {
  name: string;
  language?: string;
  category: string;
  body: string;
  channelId?: string;
  buttons?: TemplateButton[];
}

export const templatesService = {
  async list(): Promise<MessageTemplate[]> {
    const { data } = await api.get('/templates');
    return data.data ?? data;
  },
  async create(input: CreateTemplateInput): Promise<MessageTemplate> {
    const { data } = await api.post('/templates', input);
    return data.data ?? data;
  },
  async sync(id: string): Promise<MessageTemplate> {
    const { data } = await api.post(`/templates/${id}/sync`);
    return data.data ?? data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },
};
