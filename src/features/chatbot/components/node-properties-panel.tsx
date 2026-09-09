'use client';

import { useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface NodePropertiesPanelProps {
  node: Node;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const inputCls = 'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary';
const labelCls = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1';

export function NodePropertiesPanel({ node, onUpdate, onDelete, onClose }: NodePropertiesPanelProps) {
  const data = node.data as Record<string, any>;
  const update = useCallback(
    (key: string, value: any) => onUpdate(node.id, { ...data, [key]: value }),
    [node.id, data, onUpdate],
  );

  return (
    <div className="w-72 border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Propriedades</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-500 dark:bg-zinc-800">
            {node.type}
          </span>
        </div>

        {node.type === 'MESSAGE' && (
          <div>
            <label className={labelCls}>Mensagem</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={data.message || ''}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Olá {{name}}, como posso ajudar?"
            />
            <p className="mt-1 text-[10px] text-zinc-400">Use {'{{variavel}}'} para interpolar</p>
          </div>
        )}

        {node.type === 'MENU' && (
          <>
            <div>
              <label className={labelCls}>Título do Menu</label>
              <input className={inputCls} value={data.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Escolha uma opção:" />
            </div>
            <div>
              <label className={labelCls}>Opções</label>
              {(data.options || []).map((opt: any, i: number) => (
                <div key={i} className="mt-1 flex gap-1">
                  <input
                    className={`${inputCls} flex-1`}
                    value={opt.label}
                    onChange={(e) => {
                      const opts = [...(data.options || [])];
                      opts[i] = { ...opts[i], label: e.target.value };
                      update('options', opts);
                    }}
                    placeholder={`Opção ${i + 1}`}
                  />
                  <button
                    onClick={() => update('options', (data.options || []).filter((_: any, j: number) => j !== i))}
                    className="rounded p-1 text-zinc-400 hover:text-red-500"
                  ><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button
                onClick={() => update('options', [...(data.options || []), { label: '', value: `opt_${Date.now()}` }])}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >+ Adicionar opção</button>
            </div>
          </>
        )}

        {node.type === 'CONDITION' && (
          <>
            <div>
              <label className={labelCls}>Variável</label>
              <input className={inputCls} value={data.variable || ''} onChange={(e) => update('variable', e.target.value)} placeholder="lastMenuSelection" />
            </div>
            <div>
              <label className={labelCls}>Operador</label>
              <select className={inputCls} value={data.operator || 'equals'} onChange={(e) => update('operator', e.target.value)}>
                <option value="equals">Igual a</option>
                <option value="not_equals">Diferente de</option>
                <option value="contains">Contém</option>
                <option value="gt">Maior que</option>
                <option value="lt">Menor que</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Valor</label>
              <input className={inputCls} value={data.value || ''} onChange={(e) => update('value', e.target.value)} />
            </div>
          </>
        )}

        {node.type === 'WAIT' && (
          <>
            <div>
              <label className={labelCls}>Mensagem de espera</label>
              <input className={inputCls} value={data.prompt || ''} onChange={(e) => update('prompt', e.target.value)} placeholder="Digite sua resposta..." />
            </div>
            <div>
              <label className={labelCls}>Salvar resposta em</label>
              <input className={inputCls} value={data.saveAs || ''} onChange={(e) => update('saveAs', e.target.value)} placeholder="lastInput" />
            </div>
          </>
        )}

        {node.type === 'QUESTION' && (
          <>
            <div>
              <label className={labelCls}>Pergunta</label>
              <textarea className={`${inputCls} min-h-[70px] resize-y`} value={data.question || ''} onChange={(e) => update('question', e.target.value)} placeholder="Qual o seu nome?" />
            </div>
            <div>
              <label className={labelCls}>Salvar resposta em</label>
              <input className={inputCls} value={data.variable || ''} onChange={(e) => update('variable', e.target.value)} placeholder="nome" />
            </div>
          </>
        )}

        {node.type === 'HANDOFF_AI' && (
          <>
            <div className="rounded-lg bg-indigo-50 p-2.5 text-xs text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
              A partir daqui a <strong>IA assume</strong> a conversa. O cliente pode digitar <strong>menu</strong> para voltar ao fluxo.
            </div>
            <div>
              <label className={labelCls}>Mensagem-ponte (opcional)</label>
              <input className={inputCls} value={data.message || ''} onChange={(e) => update('message', e.target.value)} placeholder="Vou te ajudar com mais detalhes…" />
            </div>
          </>
        )}

        {node.type === 'TRANSFER' && (
          <div>
            <label className={labelCls}>Mensagem de transferência</label>
            <input className={inputCls} value={data.message || ''} onChange={(e) => update('message', e.target.value)} placeholder="Transferindo para um atendente..." />
          </div>
        )}

        {node.type === 'HTTP_REQUEST' && (
          <>
            <div>
              <label className={labelCls}>Método</label>
              <select className={inputCls} value={data.method || 'GET'} onChange={(e) => update('method', e.target.value)}>
                <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>URL</label>
              <input className={inputCls} value={data.url || ''} onChange={(e) => update('url', e.target.value)} placeholder="https://api.exemplo.com/clientes/{{telefone}}" />
            </div>
            <div>
              <label className={labelCls}>Autenticação</label>
              <select className={inputCls} value={(data.auth?.type) || 'none'} onChange={(e) => update('auth', { ...(data.auth || {}), type: e.target.value })}>
                <option value="none">Nenhuma</option>
                <option value="bearer">Bearer token</option>
                <option value="basic">Basic (usuário/senha)</option>
                <option value="apiKey">API key (header)</option>
              </select>
            </div>
            {data.auth?.type === 'bearer' && (
              <input className={inputCls} value={data.auth?.token || ''} onChange={(e) => update('auth', { ...(data.auth || {}), token: e.target.value })} placeholder="Token (aceita {{var}})" />
            )}
            {data.auth?.type === 'basic' && (
              <div className="flex gap-1">
                <input className={inputCls} value={data.auth?.username || ''} onChange={(e) => update('auth', { ...(data.auth || {}), username: e.target.value })} placeholder="usuário" />
                <input className={inputCls} value={data.auth?.password || ''} onChange={(e) => update('auth', { ...(data.auth || {}), password: e.target.value })} placeholder="senha" />
              </div>
            )}
            {data.auth?.type === 'apiKey' && (
              <div className="flex gap-1">
                <input className={inputCls} value={data.auth?.headerName || ''} onChange={(e) => update('auth', { ...(data.auth || {}), headerName: e.target.value })} placeholder="X-API-Key" />
                <input className={inputCls} value={data.auth?.headerValue || ''} onChange={(e) => update('auth', { ...(data.auth || {}), headerValue: e.target.value })} placeholder="valor" />
              </div>
            )}
            {data.method && data.method !== 'GET' && (
              <div>
                <label className={labelCls}>Corpo (JSON)</label>
                <textarea className={`${inputCls} min-h-[70px] resize-y font-mono text-xs`} value={data.body || ''} onChange={(e) => update('body', e.target.value)} placeholder='{"nome": "{{nome}}"}' />
              </div>
            )}
            <div>
              <label className={labelCls}>Salvar resposta em</label>
              <input className={inputCls} value={data.saveAs || ''} onChange={(e) => update('saveAs', e.target.value)} placeholder="apiResponse" />
            </div>
            <div>
              <label className={labelCls}>Caminho da resposta (opcional)</label>
              <input className={inputCls} value={data.responsePath || ''} onChange={(e) => update('responsePath', e.target.value)} placeholder="data.cliente.nome" />
            </div>
            <p className="text-[10px] text-zinc-400">Saídas: <b>sucesso</b> (2xx) e <b>erro</b>. Ligue cada uma ao próximo nó.</p>
          </>
        )}

        {node.type === 'AI' && (
          <>
            <div>
              <label className={labelCls}>Prompt</label>
              <textarea className={`${inputCls} min-h-[80px] resize-y`} value={data.prompt || ''} onChange={(e) => update('prompt', e.target.value)} placeholder="Responda a dúvida do cliente: {{lastInput}}" />
            </div>
            <div>
              <label className={labelCls}>Instrução do sistema (opcional)</label>
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={data.system || ''} onChange={(e) => update('system', e.target.value)} placeholder="Você é o atendente da AAP-VR..." />
            </div>
            <div>
              <label className={labelCls}>Modelo</label>
              <select className={inputCls} value={data.model || 'openai/gpt-4o-mini'} onChange={(e) => update('model', e.target.value)}>
                <option value="openai/gpt-4o-mini">gpt-4o-mini (rápido/barato)</option>
                <option value="openai/gpt-4o">gpt-4o (melhor)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Salvar resposta em</label>
              <input className={inputCls} value={data.saveAs || ''} onChange={(e) => update('saveAs', e.target.value)} placeholder="aiResponse" />
            </div>
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <input type="checkbox" checked={data.sendAsMessage !== false} onChange={(e) => update('sendAsMessage', e.target.checked)} />
              Enviar a resposta ao cliente
            </label>
          </>
        )}

        {node.type !== 'START' && node.type !== 'END_FLOW' && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              onClick={() => onDelete(node.id)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover nó
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
