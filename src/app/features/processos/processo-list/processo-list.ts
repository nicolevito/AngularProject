import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessoService } from '../data-access/processo.service';
import { ClienteService } from '../../clientes/data-access/cliente.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import {
  AREA_DIREITO_LABEL,
  AreaDireito,
  nomeExibicaoCliente,
  STATUS_PROCESSO_LABEL,
  StatusProcesso,
} from '../../../core/models';

const COR_STATUS: Record<StatusProcesso, 'sucesso' | 'neutro' | 'aviso' | 'info' | 'perigo'> = {
  ativo: 'sucesso',
  suspenso: 'aviso',
  arquivado: 'neutro',
  encerrado: 'neutro',
  em_recurso: 'info',
};

@Component({
  selector: 'app-processo-list',
  imports: [
    RouterLink,
    CurrencyPipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTooltipModule,
    EmptyState,
    StatusBadge,
    HasRoleDirective,
  ],
  templateUrl: './processo-list.html',
  styleUrl: './processo-list.scss',
})
export class ProcessoList {
  private readonly processoService = inject(ProcessoService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly processos = this.processoService.processos;
  readonly busca = signal('');
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(10);

  readonly colunas = ['numero', 'cliente', 'area', 'status', 'valorCausa', 'acoes'];
  readonly statusOpcoes = Object.entries(STATUS_PROCESSO_LABEL) as [StatusProcesso, string][];

  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  readonly statusFiltro = computed<StatusProcesso | ''>(() => {
    const status = this.queryParams().get('status');
    return status && status in STATUS_PROCESSO_LABEL ? (status as StatusProcesso) : '';
  });

  private readonly nomeClientePorId = computed(() => {
    const mapa = new Map<string, string>();
    this.clienteService.clientes().forEach((cliente) => mapa.set(cliente.id, nomeExibicaoCliente(cliente)));
    return mapa;
  });

  nomeCliente(clienteId: string): string {
    return this.nomeClientePorId().get(clienteId) ?? '—';
  }

  areaLabel(area: AreaDireito): string {
    return AREA_DIREITO_LABEL[area];
  }

  statusLabel(status: StatusProcesso): string {
    return STATUS_PROCESSO_LABEL[status];
  }

  statusCor(status: StatusProcesso) {
    return COR_STATUS[status];
  }

  readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const status = this.statusFiltro();
    return this.processos().filter((processo) => {
      const bateStatus = !status || processo.status === status;
      if (!bateStatus) return false;
      if (!termo) return true;
      const cliente = this.nomeCliente(processo.clienteId).toLowerCase();
      return processo.numeroProcesso.toLowerCase().includes(termo) || cliente.includes(termo);
    });
  });

  readonly paginados = computed(() => {
    const inicio = this.pagina() * this.tamanhoPagina();
    return this.filtrados().slice(inicio, inicio + this.tamanhoPagina());
  });

  buscar(termo: string): void {
    this.busca.set(termo);
    this.pagina.set(0);
  }

  filtrarStatus(status: StatusProcesso | ''): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { status: status || null }, queryParamsHandling: 'merge' });
    this.pagina.set(0);
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
  }
}
