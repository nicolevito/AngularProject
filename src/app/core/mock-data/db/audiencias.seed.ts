import { Audiencia } from '../../models';

export const AUDIENCIAS_SEED: Audiencia[] = [
  { id: 'aud-1', processoId: 'proc-1', tipo: 'conciliacao', data: '2026-08-25T14:00:00', local: 'Fórum João Mendes Jr., Sala 12', virtual: false, status: 'agendada', advogadoId: 'usr-1' },
  { id: 'aud-2', processoId: 'proc-8', tipo: 'instrucao', data: '2026-08-14T09:30:00', local: 'Videoconferência', virtual: true, linkVideo: 'https://meet.tjpr.jus.br/sala-8842', status: 'agendada', advogadoId: 'usr-2' },
  { id: 'aud-3', processoId: 'proc-2', tipo: 'una', data: '2026-09-03T10:00:00', local: '30ª Vara do Trabalho, Sala 4', virtual: false, status: 'agendada', advogadoId: 'usr-2' },
  { id: 'aud-4', processoId: 'proc-15', tipo: 'conciliacao', data: '2026-09-01T11:00:00', local: 'Videoconferência', virtual: true, linkVideo: 'https://meet.tjsc.jus.br/sala-3301', status: 'agendada', advogadoId: 'usr-1' },
  { id: 'aud-5', processoId: 'proc-9', tipo: 'instrucao', data: '2026-09-18T15:00:00', local: 'Fórum Clóvis Beviláqua, Sala 7', virtual: false, status: 'agendada', advogadoId: 'usr-1' },
  { id: 'aud-6', processoId: 'proc-3', tipo: 'julgamento', data: '2026-10-05T13:30:00', local: 'Tribunal de Justiça de MG, Turma Criminal', virtual: false, status: 'agendada', advogadoId: 'usr-1' },
  { id: 'aud-7', processoId: 'proc-7', tipo: 'julgamento', data: '2022-11-20T14:00:00', local: 'Fórum João Mendes Jr., Sala 5', virtual: false, status: 'realizada', advogadoId: 'usr-1' },
  { id: 'aud-8', processoId: 'proc-12', tipo: 'instrucao', data: '2023-04-15T09:00:00', local: 'Vara de Família, Sala 2', virtual: false, status: 'realizada', advogadoId: 'usr-2' },
  { id: 'aud-9', processoId: 'proc-16', tipo: 'conciliacao', data: '2026-08-20T16:00:00', local: 'Videoconferência', virtual: true, linkVideo: 'https://meet.trt2.jus.br/sala-1290', status: 'agendada', advogadoId: 'usr-2' },
];
