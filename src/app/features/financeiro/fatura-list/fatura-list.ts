import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FaturaService } from '../data-access/fatura.service';
import { ClienteService } from '../../clientes/data-access/cliente.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import { FormaPagamento, nomeExibicaoCliente, STATUS_FATURA_LABEL, StatusFatura } from '../../../core/models';

const COR_STATUS: Record<StatusFatura, CorBadge> = {
  pendente: 'info',
  paga: 'sucesso',
  atrasada: 'perigo',
  cancelada: 'neutro',
};

@Component({
  selector: 'app-fatura-list',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    EmptyState,
    StatusBadge,
  ],
  templateUrl: './fatura-list.html',
  styleUrl: './fatura-list.scss',
})
export class FaturaList {
  private readonly faturaService = inject(FaturaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);

  readonly statusFiltro = signal<StatusFatura | ''>(this.statusInicialDaRota());
  readonly colunas = ['numero', 'cliente', 'emissao', 'vencimento', 'valor', 'status', 'acoes'];
  readonly statusOpcoes = Object.entries(STATUS_FATURA_LABEL) as [StatusFatura, string][];

  private statusInicialDaRota(): StatusFatura | '' {
    const status = this.route.snapshot.queryParamMap.get('status');
    return status && status in STATUS_FATURA_LABEL ? (status as StatusFatura) : '';
  }
  readonly formasPagamento: FormaPagamento[] = ['pix', 'boleto', 'cartao', 'transferencia'];

  private readonly nomeClientePorId = computed(() => {
    const mapa = new Map<string, string>();
    this.clienteService.clientes().forEach((c) => mapa.set(c.id, nomeExibicaoCliente(c)));
    return mapa;
  });

  nomeCliente(clienteId: string): string {
    return this.nomeClientePorId().get(clienteId) ?? '—';
  }

  statusLabel(status: StatusFatura): string {
    return STATUS_FATURA_LABEL[status];
  }

  statusCor(status: StatusFatura): CorBadge {
    return COR_STATUS[status];
  }

  readonly faturasFiltradas = computed(() => {
    const status = this.statusFiltro();
    return [...this.faturaService.faturas()]
      .filter((fatura) => !status || fatura.status === status)
      .sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao));
  });

  readonly resumo = computed(() => {
    const faturas = this.faturaService.faturas();
    const somaPorStatus = (status: StatusFatura) =>
      faturas.filter((f) => f.status === status).reduce((soma, f) => soma + f.valorTotal, 0);
    return {
      pendente: somaPorStatus('pendente'),
      paga: somaPorStatus('paga'),
      atrasada: somaPorStatus('atrasada'),
    };
  });

  filtrarStatus(status: StatusFatura | ''): void {
    this.statusFiltro.set(status);
  }

  marcarPaga(id: string, formaPagamento: FormaPagamento): void {
    this.faturaService.marcarPaga(id, formaPagamento).subscribe();
  }

  cancelar(id: string): void {
    if (!confirm('Cancelar esta fatura?')) return;
    this.faturaService.cancelar(id).subscribe();
  }
}
