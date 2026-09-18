import type { Effort, ModelOption } from '../types';

export const GROK_MODELS: ModelOption[] = [
  { provider: 'grok', id: 'grok-4.6', label: 'Grok 4.6', hint: 'Flagship' },
  { provider: 'grok', id: 'grok-4.5', label: 'Grok 4.5', hint: 'Estável' },
  { provider: 'grok', id: 'grok-4.3', label: 'Grok 4.3', hint: 'Rápido' },
  { provider: 'grok', id: 'grok-build-0.1', label: 'Grok Build', hint: 'Código' },
];

export const CODEX_MODELS: ModelOption[] = [
  { provider: 'codex', id: 'gpt-4.1', label: 'Codex GPT-4.1', hint: 'OpenAI' },
  { provider: 'codex', id: 'o4-mini', label: 'Codex o4-mini', hint: 'Rápido' },
];

export const EFFORTS: { id: Effort; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'xhigh', label: 'Extra High' },
];

export function modelLabel(modelId: string, fallback = modelId) {
  return [...GROK_MODELS, ...CODEX_MODELS].find((model) => model.id === modelId)?.label ?? fallback;
}

export function effortLabel(effort: Effort) {
  return EFFORTS.find((item) => item.id === effort)?.label ?? effort;
}

export function selectorLabel(modelId: string, effort: Effort) {
  const model = [...GROK_MODELS, ...CODEX_MODELS].find((item) => item.id === modelId);
  if (!model) return `${modelId} ${effortLabel(effort)}`;
  const speed = effort === 'low' || model.id === 'grok-4.3' ? 'Fast' : '';
  return [model.label, effortLabel(effort), speed].filter(Boolean).join(' ');
}
