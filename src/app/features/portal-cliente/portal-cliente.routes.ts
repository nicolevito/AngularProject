import { Routes } from '@angular/router';

export const PORTAL_CLIENTE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'meus-processos' },
  {
    path: 'meus-processos',
    loadComponent: () => import('./meus-processos/meus-processos').then((m) => m.MeusProcessos),
  },
  {
    path: 'meus-documentos',
    loadComponent: () => import('./meus-documentos/meus-documentos').then((m) => m.MeusDocumentos),
  },
];
