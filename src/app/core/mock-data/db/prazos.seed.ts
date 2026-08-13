import { Prazo } from '../../models';

/**
 * Datas relativas a "hoje" (ambiente de demonstração assume a data atual do sistema).
 * Distribuídas propositalmente para exercitar todos os níveis de urgência
 * (crítica, alta, média, baixa) e alguns prazos já concluídos.
 */
export const PRAZOS_SEED: Prazo[] = [
  { id: 'prz-1', processoId: 'proc-1', titulo: 'Réplica à contestação', tipo: 'manifestacao', dataVencimento: '2026-08-14', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-2', processoId: 'proc-1', titulo: 'Comparecimento à audiência de conciliação', tipo: 'audiencia', dataVencimento: '2026-08-25', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-3', processoId: 'proc-2', titulo: 'Impugnação à contestação', tipo: 'manifestacao', dataVencimento: '2026-08-15', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-4', processoId: 'proc-2', titulo: 'Apresentação de rol de testemunhas', tipo: 'manifestacao', dataVencimento: '2026-09-10', responsavelId: 'usr-4', concluido: false },
  { id: 'prz-5', processoId: 'proc-3', titulo: 'Razões de apelação', tipo: 'recurso', dataVencimento: '2026-08-17', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-6', processoId: 'proc-4', titulo: 'Contrarrazões', tipo: 'manifestacao', dataVencimento: '2026-08-18', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-7', processoId: 'proc-4', titulo: 'Juntada de laudo pericial', tipo: 'outro', dataVencimento: '2026-09-20', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-8', processoId: 'proc-5', titulo: 'Manifestação sobre laudo fiscal', tipo: 'manifestacao', dataVencimento: '2026-08-21', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-9', processoId: 'proc-6', titulo: 'Pagamento de custas processuais', tipo: 'pagamento', dataVencimento: '2026-08-22', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-10', processoId: 'proc-6', titulo: 'Contestação do réu (acompanhar)', tipo: 'contestacao', dataVencimento: '2026-10-01', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-11', processoId: 'proc-8', titulo: 'Comparecimento à audiência de instrução', tipo: 'audiencia', dataVencimento: '2026-08-14', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-12', processoId: 'proc-8', titulo: 'Entrega de proposta de partilha de bens', tipo: 'manifestacao', dataVencimento: '2026-08-28', responsavelId: 'usr-4', concluido: false },
  { id: 'prz-13', processoId: 'proc-9', titulo: 'Réplica à contestação', tipo: 'manifestacao', dataVencimento: '2026-08-19', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-14', processoId: 'proc-10', titulo: 'Recurso administrativo fiscal', tipo: 'recurso', dataVencimento: '2026-09-05', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-15', processoId: 'proc-13', titulo: 'Contestação da parte ré (acompanhar)', tipo: 'contestacao', dataVencimento: '2026-08-16', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-16', processoId: 'proc-13', titulo: 'Perícia técnica em sistemas', tipo: 'outro', dataVencimento: '2026-09-30', responsavelId: 'usr-3', concluido: false },
  { id: 'prz-17', processoId: 'proc-14', titulo: 'Razões de recurso especial', tipo: 'recurso', dataVencimento: '2026-08-20', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-18', processoId: 'proc-15', titulo: 'Réplica à contestação da companhia aérea', tipo: 'manifestacao', dataVencimento: '2026-08-27', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-19', processoId: 'proc-16', titulo: 'Manifestação sobre proposta de acordo', tipo: 'manifestacao', dataVencimento: '2026-08-24', responsavelId: 'usr-2', concluido: false },
  { id: 'prz-20', processoId: 'proc-9', titulo: 'Pagamento de honorários periciais', tipo: 'pagamento', dataVencimento: '2026-10-15', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-21', processoId: 'proc-1', titulo: 'Protocolo de petição inicial', tipo: 'outro', dataVencimento: '2023-03-05', responsavelId: 'usr-1', concluido: true, dataConclusao: '2023-03-05' },
  { id: 'prz-22', processoId: 'proc-2', titulo: 'Distribuição da reclamação trabalhista', tipo: 'outro', dataVencimento: '2023-05-10', responsavelId: 'usr-2', concluido: true, dataConclusao: '2023-05-09' },
  { id: 'prz-23', processoId: 'proc-7', titulo: 'Contestação apresentada', tipo: 'contestacao', dataVencimento: '2022-03-20', responsavelId: 'usr-1', concluido: true, dataConclusao: '2022-03-19' },
  { id: 'prz-24', processoId: 'proc-12', titulo: 'Homologação de partilha', tipo: 'outro', dataVencimento: '2023-05-30', responsavelId: 'usr-2', concluido: true, dataConclusao: '2023-05-28' },
  { id: 'prz-25', processoId: 'proc-3', titulo: 'Pagamento de custas recursais', tipo: 'pagamento', dataVencimento: '2026-08-05', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-26', processoId: 'proc-11', titulo: 'Manifestação sobre desistência', tipo: 'manifestacao', dataVencimento: '2021-11-18', responsavelId: 'usr-1', concluido: true, dataConclusao: '2021-11-17' },
  { id: 'prz-27', processoId: 'proc-5', titulo: 'Comparecimento à perícia técnica', tipo: 'audiencia', dataVencimento: '2026-09-12', responsavelId: 'usr-1', concluido: false },
  { id: 'prz-28', processoId: 'proc-10', titulo: 'Juntada de guias de recolhimento', tipo: 'outro', dataVencimento: '2026-08-15', responsavelId: 'usr-2', concluido: false },
];
