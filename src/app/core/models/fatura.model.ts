export type StatusFatura = 'pendente' | 'paga' | 'atrasada' | 'cancelada';
export type FormaPagamento = 'pix' | 'boleto' | 'cartao' | 'transferencia';

export interface ItemFatura {
  descricao: string;
  valor: number;
}

export interface Fatura {
  id: string;
  clienteId: string;
  processoId?: string;
  numero: string;
  itens: ItemFatura[];
  valorTotal: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusFatura;
  formaPagamento?: FormaPagamento;
}

export const STATUS_FATURA_LABEL: Record<StatusFatura, string> = {
  pendente: 'Pendente',
  paga: 'Paga',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
};
