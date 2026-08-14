import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models';

interface SubItemMenu {
  rota: string;
  label: string;
  queryParams?: Record<string, string>;
}

interface ItemMenu {
  label: string;
  icone: string;
  roles: Role[];
  rota?: string;
  filhos?: SubItemMenu[];
}

const MENU_INTERNO: ItemMenu[] = [
  { rota: '/dashboard', label: 'Dashboard', icone: 'dashboard', roles: ['advogado', 'estagiario'] },
  {
    label: 'Clientes',
    icone: 'groups',
    roles: ['advogado', 'estagiario'],
    filhos: [
      { rota: '/clientes', label: 'Todos os Clientes' },
      { rota: '/clientes', label: 'Clientes Ativos', queryParams: { status: 'ativo' } },
      { rota: '/clientes', label: 'Clientes Inativos', queryParams: { status: 'inativo' } },
    ],
  },
  {
    label: 'Processos',
    icone: 'gavel',
    roles: ['advogado', 'estagiario'],
    filhos: [
      { rota: '/processos', label: 'Todos os Processos' },
      { rota: '/processos', label: 'Processos Ativos', queryParams: { status: 'ativo' } },
      { rota: '/processos', label: 'Processos Encerrados', queryParams: { status: 'encerrado' } },
    ],
  },
  {
    label: 'Prazos',
    icone: 'event_busy',
    roles: ['advogado', 'estagiario'],
    filhos: [
      { rota: '/prazos', label: 'Lista de Prazos' },
      { rota: '/prazos/calendario', label: 'Calendário de Prazos' },
    ],
  },
  { rota: '/agenda', label: 'Agenda', icone: 'calendar_month', roles: ['advogado', 'estagiario'] },
  { rota: '/documentos', label: 'Documentos', icone: 'folder', roles: ['advogado', 'estagiario'] },
  {
    label: 'Financeiro',
    icone: 'payments',
    roles: ['advogado'],
    filhos: [
      { rota: '/financeiro', label: 'Todas as Faturas' },
      { rota: '/financeiro', label: 'Faturas Pendentes', queryParams: { status: 'pendente' } },
      { rota: '/financeiro', label: 'Faturas Atrasadas', queryParams: { status: 'atrasada' } },
    ],
  },
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
  private readonly router = inject(Router);

  readonly itemClicado = output<void>();

  private readonly urlAtual = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly overridesGrupo = signal<Map<string, boolean>>(new Map());

  readonly itens = computed(() => {
    const role = this.authService.role();
    const menu = role === 'cliente' ? MENU_PORTAL : MENU_INTERNO;
    return menu.filter((item) => !role || item.roles.includes(role));
  });

  /** Um grupo é considerado "ativo" quando a rota atual pertence a algum de seus filhos. */
  grupoAtivo(item: ItemMenu): boolean {
    if (!item.filhos) return false;
    const caminho = this.urlAtual().split('?')[0];
    return item.filhos.some((filho) => caminho === filho.rota || caminho.startsWith(`${filho.rota}/`));
  }

  grupoAberto(item: ItemMenu): boolean {
    if (!item.filhos) return false;
    const override = this.overridesGrupo().get(item.label);
    return override ?? this.grupoAtivo(item);
  }

  alternarGrupo(item: ItemMenu): void {
    const estaAberto = this.grupoAberto(item);
    this.overridesGrupo.update((mapa) => new Map(mapa).set(item.label, !estaAberto));
  }
}
