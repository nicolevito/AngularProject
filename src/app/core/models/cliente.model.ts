export type TipoPessoa = 'fisica' | 'juridica';
export type StatusCliente = 'ativo' | 'inativo';

export const STATUS_CLIENTE_LABEL: Record<StatusCliente, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
};

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface ClienteBase {
  id: string;
  status: StatusCliente;
  email: string;
  telefone: string;
  endereco: Endereco;
  criadoEm: string;
}

export interface ClientePF extends ClienteBase {
  tipo: 'fisica';
  nome: string;
  cpf: string;
  dataNascimento: string;
  profissao?: string;
  representanteLegalMenor?: string;
}

export interface ClientePJ extends ClienteBase {
  tipo: 'juridica';
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  representanteLegal: string;
}

export type Cliente = ClientePF | ClientePJ;

export function nomeExibicaoCliente(cliente: Cliente): string {
  return cliente.tipo === 'fisica' ? cliente.nome : cliente.nomeFantasia || cliente.razaoSocial;
}

export function documentoCliente(cliente: Cliente): string {
  return cliente.tipo === 'fisica' ? cliente.cpf : cliente.cnpj;
}
