import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PrazoService } from '../data-access/prazo.service';
import { ProcessoService } from '../../processos/data-access/processo.service';
import { CalendarMonth, EventoCalendario } from '../../../shared/components/calendar-month/calendar-month';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import { calcularUrgencia, UrgenciaPrazo } from '../../../core/models';

const COR_URGENCIA: Record<UrgenciaPrazo, CorBadge> = {
  baixa: 'neutro',
  media: 'info',
  alta: 'aviso',
  critica: 'perigo',
};

@Component({
  selector: 'app-prazo-calendar',
  imports: [RouterLink, DatePipe, MatCardModule, MatButtonModule, MatIconModule, CalendarMonth, StatusBadge],
  templateUrl: './prazo-calendar.html',
  styleUrl: './prazo-calendar.scss',
})
export class PrazoCalendar {
  private readonly prazoService = inject(PrazoService);
  private readonly processoService = inject(ProcessoService);

  readonly diaSelecionado = signal<string | null>(null);

  readonly eventos = computed<EventoCalendario[]>(() =>
    this.prazoService
      .prazos()
      .filter((prazo) => !prazo.concluido)
      .map((prazo) => ({
        data: prazo.dataVencimento,
        titulo: prazo.titulo,
        cor: COR_URGENCIA[calcularUrgencia(prazo.dataVencimento)],
      })),
  );

  private readonly numeroProcessoPorId = computed(() => {
    const mapa = new Map<string, string>();
    this.processoService.processos().forEach((p) => mapa.set(p.id, p.numeroProcesso));
    return mapa;
  });

  numeroProcesso(processoId: string): string {
    return this.numeroProcessoPorId().get(processoId) ?? '—';
  }

  readonly prazosDoDiaSelecionado = computed(() => {
    const dia = this.diaSelecionado();
    if (!dia) return [];
    return this.prazoService.prazos().filter((prazo) => prazo.dataVencimento.slice(0, 10) === dia);
  });

  urgenciaCor(dataVencimento: string): CorBadge {
    return COR_URGENCIA[calcularUrgencia(dataVencimento)];
  }
}
