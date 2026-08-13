import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const PROCESSOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./processo-list/processo-list').then((m) => m.ProcessoList),
  },
  {
    path: 'novo',
    canActivate: [roleGuard(['advogado'])],
    loadComponent: () => import('./processo-form/processo-form').then((m) => m.ProcessoForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./processo-detail/processo-detail').then((m) => m.ProcessoDetail),
  },
  {
    path: ':id/editar',
    canActivate: [roleGuard(['advogado'])],
    loadComponent: () => import('./processo-form/processo-form').then((m) => m.ProcessoForm),
  },
];
