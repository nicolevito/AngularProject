export type StatusProcesso = 'ativo' | 'suspenso' | 'arquivado' | 'encerrado' | 'em_recurso';
export type AreaDireito = 'civel' | 'trabalhista' | 'tributario' | 'penal' | 'familia' | 'empresarial';
export type TipoParte = 'autor' | 'reu' | 'terceiro_interessado';
export type TipoAndamento =
  | 'peticao'
  | 'decisao'
  | 'audiencia_marcada'
  | 'movimentacao'
  | 'sentenca'
  | 'outro';

export interface Parte {
  id: string;
  nome: string;
  tipo: TipoParte;
  documento: string;
}

export interface Andamento {
  id: string;
  data: string;
  descricao: string;
  tipo: TipoAndamento;
  autorId: string;
}

export interface Processo {
  id: string;
  numeroProcesso: string;
  clienteId: string;
  advogadoResponsavelId: string;
  area: AreaDireito;
  status: StatusProcesso;
  vara: string;
  comarca: string;
  valorCausa: number;
  dataAbertura: string;
  partes: Parte[];
  andamentos: Andamento[];
  documentoIds: string[];
  observacoes?: string;
}

export const STATUS_PROCESSO_LABEL: Record<StatusProcesso, string> = {
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  arquivado: 'Arquivado',
  encerrado: 'Encerrado',
  em_recurso: 'Em recurso',
};

export const AREA_DIREITO_LABEL: Record<AreaDireito, string> = {
  civel: 'Cível',
  trabalhista: 'Trabalhista',
  tributario: 'Tributário',
  penal: 'Penal',
  familia: 'Família',
  empresarial: 'Empresarial',
};
