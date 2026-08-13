import { Routes } from '@angular/router';

export const PRAZOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./prazo-list/prazo-list').then((m) => m.PrazoList),
  },
  {
    path: 'calendario',
    loadComponent: () => import('./prazo-calendar/prazo-calendar').then((m) => m.PrazoCalendar),
  },
];
