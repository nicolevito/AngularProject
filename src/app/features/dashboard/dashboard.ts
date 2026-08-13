import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { ProcessoService } from '../processos/data-access/processo.service';
import { PrazoService } from '../prazos/data-access/prazo.service';
import { FaturaService } from '../financeiro/data-access/fatura.service';
import { ClienteService } from '../clientes/data-access/cliente.service';
import { StatusBadge, CorBadge } from '../../shared/components/status-badge/status-badge';
import {
  AREA_DIREITO_LABEL,
  calcularUrgencia,
  nomeExibicaoCliente,
  STATUS_PROCESSO_LABEL,
  StatusProcesso,
  UrgenciaPrazo,
} from '../../core/models';

const CORES_STATUS_PROCESSO: Record<StatusProcesso, string> = {
  ativo: '#1a7a45',
  suspenso: '#93610a',
  arquivado: '#8b93a1',
  encerrado: '#5b6472',
  em_recurso: '#1d5fd6',
};

const COR_URGENCIA: Record<UrgenciaPrazo, CorBadge> = {
  baixa: 'neutro',
  media: 'info',
  alta: 'aviso',
  critica: 'perigo',
};

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function chaveMes(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, BaseChartDirective, MatCardModule, MatIconModule, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly processoService = inject(ProcessoService);
  private readonly prazoService = inject(PrazoService);
  private readonly faturaService = inject(FaturaService);
  private readonly clienteService = inject(ClienteService);

  readonly ehAdvogado = computed(() => this.authService.role() === 'advogado');
  readonly nomeExibicaoCliente = nomeExibicaoCliente;

  private readonly hoje = new Date();

  // ---------- KPIs ----------
  readonly totalProcessosAtivos = computed(
    () => this.processoService.processos().filter((p) => p.status === 'ativo').length,
  );

  readonly totalClientes = computed(() => this.clienteService.clientes().length);

  readonly prazosProximos7Dias = computed(() =>
    this.prazoService
      .prazos()
      .filter((prazo) => !prazo.concluido)
      .filter((prazo) => {
        const dias = Math.ceil((new Date(prazo.dataVencimento).getTime() - this.hoje.getTime()) / 86_400_000);
        return dias >= 0 && dias <= 7;
      }).length,
  );

  readonly faturamentoDoMes = computed(() => {
    const chaveAtual = chaveMes(this.hoje);
    return this.faturaService
      .faturas()
      .filter((f) => f.status !== 'cancelada' && f.dataEmissao.slice(0, 7) === chaveAtual)
      .reduce((soma, f) => soma + f.valorTotal, 0);
  });

  readonly taxaInadimplencia = computed(() => {
    const faturas = this.faturaService.faturas().filter((f) => f.status !== 'cancelada');
    const total = faturas.reduce((soma, f) => soma + f.valorTotal, 0);
    if (total === 0) return 0;
    const atrasado = faturas.filter((f) => f.status === 'atrasada').reduce((soma, f) => soma + f.valorTotal, 0);
    return (atrasado / total) * 100;
  });

  // ---------- Gráfico: processos por status ----------
  readonly statusChartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const contagem: Record<StatusProcesso, number> = {
      ativo: 0,
      suspenso: 0,
      arquivado: 0,
      encerrado: 0,
      em_recurso: 0,
    };
    this.processoService.processos().forEach((p) => contagem[p.status]++);
    const entradas = Object.entries(contagem).filter(([, valor]) => valor > 0) as [StatusProcesso, number][];

    return {
      labels: entradas.map(([status]) => STATUS_PROCESSO_LABEL[status]),
      datasets: [
        {
          data: entradas.map(([, valor]) => valor),
          backgroundColor: entradas.map(([status]) => CORES_STATUS_PROCESSO[status]),
        },
      ],
    };
  });

  readonly statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  // ---------- Gráfico: processos por área ----------
  readonly areaChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const contagem = new Map<string, number>();
    this.processoService.processos().forEach((p) => {
      const label = AREA_DIREITO_LABEL[p.area];
      contagem.set(label, (contagem.get(label) ?? 0) + 1);
    });
    const entradas = [...contagem.entries()].sort((a, b) => b[1] - a[1]);

    return {
      labels: entradas.map(([label]) => label),
      datasets: [{ data: entradas.map(([, valor]) => valor), backgroundColor: '#1d5fd6', label: 'Processos' }],
    };
  });

  readonly areaChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  // ---------- Faturamento últimos 6 meses ----------
  readonly faturamentoChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const meses: { chave: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date(this.hoje.getFullYear(), this.hoje.getMonth() - i, 1);
      meses.push({ chave: chaveMes(data), label: `${NOMES_MES[data.getMonth()]}/${String(data.getFullYear()).slice(2)}` });
    }

    const faturas = this.faturaService.faturas();
    const somaPorMes = (status: 'paga' | 'pendente' | 'atrasada') =>
      meses.map(
        ({ chave }) =>
          faturas
            .filter((f) => f.status === status && f.dataEmissao.slice(0, 7) === chave)
            .reduce((soma, f) => soma + f.valorTotal, 0),
      );

    return {
      labels: meses.map((m) => m.label),
      datasets: [
        { data: somaPorMes('paga'), label: 'Pago', backgroundColor: '#1a7a45' },
        { data: somaPorMes('pendente'), label: 'Pendente', backgroundColor: '#1d5fd6' },
        { data: somaPorMes('atrasada'), label: 'Atrasado', backgroundColor: '#b3261e' },
      ],
    };
  });

  readonly faturamentoChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
  };

  // ---------- Prazos próximos ----------
  readonly prazosProximos = computed(() =>
    this.prazoService
      .prazos()
      .filter((prazo) => !prazo.concluido)
      .filter((prazo) => {
        const dias = Math.ceil((new Date(prazo.dataVencimento).getTime() - this.hoje.getTime()) / 86_400_000);
        return dias >= 0 && dias <= 14;
      })
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento))
      .slice(0, 6),
  );

  urgenciaCor(dataVencimento: string): CorBadge {
    return COR_URGENCIA[calcularUrgencia(dataVencimento)];
  }

  private readonly numeroProcessoPorId = computed(() => {
    const mapa = new Map<string, string>();
    this.processoService.processos().forEach((p) => mapa.set(p.id, p.numeroProcesso));
    return mapa;
  });

  numeroProcesso(processoId: string): string {
    return this.numeroProcessoPorId().get(processoId) ?? '—';
  }
}
