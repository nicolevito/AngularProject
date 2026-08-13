import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cliente-list/cliente-list').then((m) => m.ClienteList),
  },
  {
    path: 'novo',
    loadComponent: () => import('./cliente-form/cliente-form').then((m) => m.ClienteForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./cliente-detail/cliente-detail').then((m) => m.ClienteDetail),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./cliente-form/cliente-form').then((m) => m.ClienteForm),
  },
];
