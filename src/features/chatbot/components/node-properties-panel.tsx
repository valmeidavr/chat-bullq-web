'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, Trash2, CheckCircle2, AlertCircle, Loader2, LayoutList } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { channelsService, type MenuPreviewResult } from '@/features/channels/services/channels.service';
import { aiAgentsService, type AiAgent } from '@/features/ai-agents/services/ai-agents.service';

interface NodePropertiesPanelProps {
  node: Node;
  twilioChannelId?: string;
  onUpdate: (id: string, data: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const inputCls = 'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary';
const labelCls = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1';

export function NodePropertiesPanel({ node, twilioChannelId, onUpdate, onDelete, onClose }: NodePropertiesPanelProps) {
  const data = node.data as Record<string, any>;
  const update = useCallback(
    (key: string, value: any) => onUpdate(node.id, { ...data, [key]: value }),
    [node.id, data, onUpdate],
  );

  const [menuStatus, setMenuStatus] = useState<MenuPreviewResult | null>(null);
  const [menuChecking, setMenuChecking] = useState(false);
  const [agents, setAgents] = useState<AiAgent[]>([]);

  useEffect(() => {
    if (node.type !== 'AI') return;
    aiAgentsService.list().then(setAgents).catch(() => setAgents([]));
  }, [node.type]);
  const nOpts = (data.options || []).length;
  const menuKind = nOpts <= 3 ? 'Botões' : nOpts <= 10 ? 'Lista' : 'Texto (mais de 10)';

  const checkMenu = useCallback(async () => {
    if (!twilioChannelId) return;
    setMenuChecking(true);
    setMenuStatus(null);
    try {
      const res = await channelsService.menuPreview(twilioChannelId, {
        header: data.header || undefined,
        body: data.title || 'Escolha uma opção:',
        footer: data.footer || undefined,
        buttonText: data.buttonText || undefined,
        options: (data.options || []).map((o: any) => ({ id: o.value, title: o.label, description: o.description || undefined })),
      });
      setMenuStatus(res);
    } catch (err) {
      setMenuStatus({ supported: true, ok: false, error: err instanceof Error ? err.message : 'Erro' });
    } finally {
      setMenuChecking(false);
    }
  }, [twilioChannelId, data]);

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
              <label className={labelCls}>Título / Texto do Menu</label>
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={data.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Escolha uma opção:" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className={labelCls}>Cabeçalho <span className="text-zinc-400">(opcional)</span></label>
                <input className={inputCls} value={data.header || ''} onChange={(e) => update('header', e.target.value)} placeholder="Ex.: AAP-VR" />
              </div>
              <div>
                <label className={labelCls}>Rodapé <span className="text-zinc-400">(opcional)</span></label>
                <input className={inputCls} value={data.footer || ''} onChange={(e) => update('footer', e.target.value)} placeholder="Ex.: Atendimento 8h–14h" />
              </div>
              <div>
                <label className={labelCls}>Texto do botão da lista <span className="text-zinc-400">(4+ opções)</span></label>
                <input className={inputCls} value={data.buttonText || ''} onChange={(e) => update('buttonText', e.target.value)} placeholder="Ver opções" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Opções</label>
              {(data.options || []).map((opt: any, i: number) => (
                <div key={i} className="mt-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                  <div className="flex gap-1">
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
                  <input
                    className={`${inputCls} mt-1 text-xs`}
                    value={opt.description || ''}
                    onChange={(e) => {
                      const opts = [...(data.options || [])];
                      opts[i] = { ...opts[i], description: e.target.value };
                      update('options', opts);
                    }}
                    placeholder="Descrição (aparece na lista nativa) — opcional"
                  />
                </div>
              ))}
              <button
                onClick={() => update('options', [...(data.options || []), { label: '', value: `opt_${Date.now()}` }])}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >+ Adicionar opção</button>
            </div>

            {/* UI nativa do WhatsApp + status no Twilio */}
            <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <LayoutList className="h-3.5 w-3.5" /> UI nativa do WhatsApp
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {nOpts <= 3
                  ? 'Até 3 opções → enviado como botões.'
                  : nOpts <= 10
                    ? 'De 4 a 10 opções → enviado como lista para tocar.'
                    : 'Mais de 10 opções → enviado como texto numerado.'}
                {' '}Renderização atual: <span className="font-medium">{menuKind}</span>.
              </p>

              {twilioChannelId ? (
                <>
                  <button
                    onClick={checkMenu}
                    disabled={menuChecking || nOpts === 0}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {menuChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Verificar no Twilio
                  </button>
                  {menuStatus && (
                    <div className="mt-2 text-[11px]">
                      {menuStatus.supported === false ? (
                        <span className="inline-flex items-center gap-1 text-zinc-500"><AlertCircle className="h-3.5 w-3.5" /> {menuStatus.message}</span>
                      ) : menuStatus.ok ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Autorizado no Twilio ({menuStatus.kind === 'quick-reply' ? 'botões' : 'lista'}) — nativo, sem aprovação necessária.
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400"><AlertCircle className="h-3.5 w-3.5" /> {menuStatus.error}</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                  Ligue este fluxo a um canal Twilio para usar botões/lista nativos. Em outros canais, o menu vai como lista em texto.
                </p>
              )}
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
              <label className={labelCls}>Agente que responde</label>
              <select className={inputCls} value={data.agentId || ''} onChange={(e) => update('agentId', e.target.value || undefined)}>
                <option value="">— Prompt custom (sem agente) —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-zinc-400">
                Escolha um agente do Jarvis (persona/conhecimento) ou deixe em branco e use o prompt abaixo. Pode usar os dois — o agente é a base e a instrução vira trava extra.
              </p>
            </div>

            <div>
              <label className={labelCls}>Modo</label>
              <select className={inputCls} value={data.conversation ? 'conversar' : 'responder'} onChange={(e) => update('conversation', e.target.value === 'conversar')}>
                <option value="responder">Responder e seguir (1 resposta)</option>
                <option value="conversar">Conversar (vai e volta até sair)</option>
              </select>
            </div>

            {data.conversation ? (
              <>
                <div>
                  <label className={labelCls}>Mensagem de abertura</label>
                  <textarea className={`${inputCls} min-h-[50px] resize-y`} value={data.openingMessage || ''} onChange={(e) => update('openingMessage', e.target.value)} placeholder="Pode falar, estou te ouvindo 😊 (digite menu para voltar)" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Palavras de saída</label>
                    <input className={inputCls} value={(data.exitKeywords || ['menu','voltar','sair']).join(', ')} onChange={(e) => update('exitKeywords', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="menu, voltar, sair" />
                  </div>
                  <div>
                    <label className={labelCls}>Máx. de trocas</label>
                    <input type="number" min={1} className={inputCls} value={data.maxTurns ?? 10} onChange={(e) => update('maxTurns', Number(e.target.value) || 10)} />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className={labelCls}>Prompt (pergunta pra IA)</label>
                <textarea className={`${inputCls} min-h-[70px] resize-y`} value={data.prompt || ''} onChange={(e) => update('prompt', e.target.value)} placeholder="{{pergunta}}" />
              </div>
            )}

            <div>
              <label className={labelCls}>Trava / instrução {data.agentId ? 'extra' : 'do sistema'}</label>
              <textarea className={`${inputCls} min-h-[60px] resize-y`} value={data.system || ''} onChange={(e) => update('system', e.target.value)} placeholder="Só responda sobre a AAP-VR. Fora disso, recuse educadamente." />
            </div>
            <div>
              <label className={labelCls}>Mensagem de recusa (fora do escopo/erro)</label>
              <input className={inputCls} value={data.refuseMessage || ''} onChange={(e) => update('refuseMessage', e.target.value)} placeholder="Desculpe, só ajudo com assuntos da AAP-VR 😊" />
            </div>

            {!data.agentId && (
              <div>
                <label className={labelCls}>Modelo</label>
                <select className={inputCls} value={data.model || 'openai/gpt-4o-mini'} onChange={(e) => update('model', e.target.value)}>
                  <option value="openai/gpt-4o-mini">gpt-4o-mini (rápido/barato)</option>
                  <option value="openai/gpt-4o">gpt-4o (melhor)</option>
                </select>
              </div>
            )}
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
