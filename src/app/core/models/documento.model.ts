export type TipoDocumento = 'peticao' | 'contrato' | 'procuracao' | 'sentenca' | 'comprovante' | 'outro';

export interface VersaoDocumento {
  versao: number;
  dataUpload: string;
  usuarioId: string;
}

export interface Documento {
  id: string;
  processoId: string;
  nome: string;
  tipo: TipoDocumento;
  tamanhoBytes: number;
  versao: number;
  versoes: VersaoDocumento[];
  uploadPor: string;
  criadoEm: string;
}

export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  peticao: 'Petição',
  contrato: 'Contrato',
  procuracao: 'Procuração',
  sentenca: 'Sentença',
  comprovante: 'Comprovante',
  outro: 'Outro',
};
