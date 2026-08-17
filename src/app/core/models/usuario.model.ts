export type Role = 'advogado' | 'estagiario' | 'cliente';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  clienteId?: string;
  avatarUrl?: string;
  ativo: boolean;
}
