import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PrazoService } from '../data-access/prazo.service';
import { ProcessoService } from '../../processos/data-access/processo.service';
import { MockDbService } from '../../../core/mock-data/mock-db.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import { calcularUrgencia, TIPO_PRAZO_LABEL, UrgenciaPrazo } from '../../../core/models';

const COR_URGENCIA: Record<UrgenciaPrazo, CorBadge> = {
  baixa: 'neutro',
  media: 'info',
  alta: 'aviso',
  critica: 'perigo',
};

const LABEL_URGENCIA: Record<UrgenciaPrazo, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

@Component({
  selector: 'app-prazo-list',
  imports: [
    RouterLink,
    DatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    EmptyState,
    StatusBadge,
  ],
  templateUrl: './prazo-list.html',
  styleUrl: './prazo-list.scss',
})
export class PrazoList {
  private readonly prazoService = inject(PrazoService);
  private readonly processoService = inject(ProcessoService);
  private readonly mockDb = inject(MockDbService);

  readonly mostrarConcluidos = signal(false);
  readonly colunas = ['titulo', 'processo', 'tipo', 'vencimento', 'urgencia', 'responsavel', 'acoes'];

  private readonly numeroProcessoPorId = computed(() => {
    const mapa = new Map<string, string>();
    this.processoService.processos().forEach((p) => mapa.set(p.id, p.numeroProcesso));
    return mapa;
  });

  numeroProcesso(processoId: string): string {
    return this.numeroProcessoPorId().get(processoId) ?? '—';
  }

  private readonly nomeUsuarioPorId = computed(() => {
    const mapa = new Map<string, string>();
    this.mockDb.usuarios.items().forEach((u) => mapa.set(u.id, u.nome));
    return mapa;
  });

  nomeResponsavel(usuarioId: string): string {
    return this.nomeUsuarioPorId().get(usuarioId) ?? '—';
  }

  tipoLabel(tipo: keyof typeof TIPO_PRAZO_LABEL): string {
    return TIPO_PRAZO_LABEL[tipo];
  }

  urgenciaLabel(dataVencimento: string): string {
    return LABEL_URGENCIA[calcularUrgencia(dataVencimento)];
  }

  urgenciaCor(dataVencimento: string): CorBadge {
    return COR_URGENCIA[calcularUrgencia(dataVencimento)];
  }

  readonly prazosOrdenados = computed(() =>
    [...this.prazoService.prazos()]
      .filter((prazo) => this.mostrarConcluidos() || !prazo.concluido)
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento)),
  );

  alternarMostrarConcluidos(): void {
    this.mostrarConcluidos.update((v) => !v);
  }

  concluir(id: string): void {
    this.prazoService.concluir(id).subscribe();
  }
}
