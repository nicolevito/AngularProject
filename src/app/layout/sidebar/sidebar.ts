import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models';

interface ItemMenu {
  rota: string;
  label: string;
  icone: string;
  roles: Role[];
}

const MENU_INTERNO: ItemMenu[] = [
  { rota: '/dashboard', label: 'Dashboard', icone: 'dashboard', roles: ['advogado', 'estagiario'] },
  { rota: '/clientes', label: 'Clientes', icone: 'groups', roles: ['advogado', 'estagiario'] },
  { rota: '/processos', label: 'Processos', icone: 'gavel', roles: ['advogado', 'estagiario'] },
  { rota: '/prazos', label: 'Prazos', icone: 'event_busy', roles: ['advogado', 'estagiario'] },
  { rota: '/agenda', label: 'Agenda', icone: 'calendar_month', roles: ['advogado', 'estagiario'] },
  { rota: '/documentos', label: 'Documentos', icone: 'folder', roles: ['advogado', 'estagiario'] },
  { rota: '/financeiro', label: 'Financeiro', icone: 'payments', roles: ['advogado'] },
];

const MENU_PORTAL: ItemMenu[] = [
  { rota: '/portal/meus-processos', label: 'Meus Processos', icone: 'gavel', roles: ['cliente'] },
  { rota: '/portal/meus-documentos', label: 'Meus Documentos', icone: 'folder', roles: ['cliente'] },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  readonly itens = computed(() => {
    const role = this.authService.role();
    const menu = role === 'cliente' ? MENU_PORTAL : MENU_INTERNO;
    return menu.filter((item) => !role || item.roles.includes(role));
  });
}
