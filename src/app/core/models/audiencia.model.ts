export type TipoAudiencia = 'conciliacao' | 'instrucao' | 'julgamento' | 'una';
export type StatusAudiencia = 'agendada' | 'realizada' | 'cancelada' | 'remarcada';

export interface Audiencia {
  id: string;
  processoId: string;
  tipo: TipoAudiencia;
  data: string;
  local: string;
  virtual: boolean;
  linkVideo?: string;
  status: StatusAudiencia;
  advogadoId: string;
}

export const TIPO_AUDIENCIA_LABEL: Record<TipoAudiencia, string> = {
  conciliacao: 'Conciliação',
  instrucao: 'Instrução',
  julgamento: 'Julgamento',
  una: 'Una',
};
