export type TipoPrazo = 'recurso' | 'contestacao' | 'manifestacao' | 'audiencia' | 'pagamento' | 'outro';
export type UrgenciaPrazo = 'baixa' | 'media' | 'alta' | 'critica';

export interface Prazo {
  id: string;
  processoId: string;
  titulo: string;
  descricao?: string;
  dataVencimento: string;
  tipo: TipoPrazo;
  responsavelId: string;
  concluido: boolean;
  dataConclusao?: string;
}

export const TIPO_PRAZO_LABEL: Record<TipoPrazo, string> = {
  recurso: 'Recurso',
  contestacao: 'Contestação',
  manifestacao: 'Manifestação',
  audiencia: 'Audiência',
  pagamento: 'Pagamento',
  outro: 'Outro',
};

/** Deriva a urgência a partir dos dias restantes até o vencimento. */
export function calcularUrgencia(dataVencimento: string, hoje: Date = new Date()): UrgenciaPrazo {
  const vencimento = new Date(dataVencimento);
  const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 2) return 'critica';
  if (diasRestantes <= 5) return 'alta';
  if (diasRestantes <= 10) return 'media';
  return 'baixa';
}
