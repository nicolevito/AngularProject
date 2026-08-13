import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['advogado', 'estagiario'])],
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'clientes',
        canActivate: [roleGuard(['advogado', 'estagiario'])],
        loadChildren: () => import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
      },
      {
        path: 'processos',
        canActivate: [roleGuard(['advogado', 'estagiario'])],
        loadChildren: () => import('./features/processos/processos.routes').then((m) => m.PROCESSOS_ROUTES),
      },
      {
        path: 'prazos',
        canActivate: [roleGuard(['advogado', 'estagiario'])],
        loadChildren: () => import('./features/prazos/prazos.routes').then((m) => m.PRAZOS_ROUTES),
      },
      {
        path: 'agenda',
        canActivate: [roleGuard(['advogado', 'estagiario'])],
        loadChildren: () => import('./features/agenda/agenda.routes').then((m) => m.AGENDA_ROUTES),
      },
      {
        path: 'documentos',
        canActivate: [roleGuard(['advogado', 'estagiario'])],
        loadChildren: () => import('./features/documentos/documentos.routes').then((m) => m.DOCUMENTOS_ROUTES),
      },
      {
        path: 'financeiro',
        canActivate: [roleGuard(['advogado'])],
        loadChildren: () => import('./features/financeiro/financeiro.routes').then((m) => m.FINANCEIRO_ROUTES),
      },
      {
        path: 'portal',
        canActivate: [roleGuard(['cliente'])],
        loadChildren: () =>
          import('./features/portal-cliente/portal-cliente.routes').then((m) => m.PORTAL_CLIENTE_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
