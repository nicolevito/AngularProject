import { Routes } from '@angular/router';

export const AGENDA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./audiencia-calendar/audiencia-calendar').then((m) => m.AudienciaCalendar),
  },
];
