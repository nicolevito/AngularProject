import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [provideCharts(withDefaultRegisterables())],
    loadComponent: () => import('./dashboard').then((m) => m.Dashboard),
  },
];
