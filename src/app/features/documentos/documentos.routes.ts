import { Routes } from '@angular/router';

export const DOCUMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./documento-list/documento-list').then((m) => m.DocumentoList),
  },
];
