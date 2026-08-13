import { Routes } from '@angular/router';

export const FINANCEIRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./fatura-list/fatura-list').then((m) => m.FaturaList),
  },
  {
    path: 'faturas/nova',
    loadComponent: () => import('./fatura-form/fatura-form').then((m) => m.FaturaForm),
  },
];
