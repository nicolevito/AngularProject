import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AudienciaService } from '../data-access/audiencia.service';
import { ProcessoService } from '../../processos/data-access/processo.service';
import { CalendarMonth, EventoCalendario } from '../../../shared/components/calendar-month/calendar-month';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import { StatusAudiencia, TIPO_AUDIENCIA_LABEL } from '../../../core/models';

const COR_STATUS_AUDIENCIA: Record<StatusAudiencia, CorBadge> = {
  agendada: 'info',
  realizada: 'sucesso',
  cancelada: 'perigo',
  remarcada: 'aviso',
};

const LABEL_STATUS_AUDIENCIA: Record<StatusAudiencia, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  remarcada: 'Remarcada',
};

@Component({
  selector: 'app-audiencia-calendar',
  imports: [RouterLink, DatePipe, MatCardModule, MatIconModule, CalendarMonth, StatusBadge],
  templateUrl: './audiencia-calendar.html',
  styleUrl: './audiencia-calendar.scss',
})
export class AudienciaCalendar {
  private readonly audienciaService = inject(AudienciaService);
  private readonly processoService = inject(ProcessoService);

  readonly diaSelecionado = signal<string | null>(null);
  readonly TIPO_AUDIENCIA_LABEL = TIPO_AUDIENCIA_LABEL;
  readonly LABEL_STATUS_AUDIENCIA = LABEL_STATUS_AUDIENCIA;

  readonly eventos = computed<EventoCalendario[]>(() =>
    this.audienciaService.audiencias().map((audiencia) => ({
      data: audiencia.data,
      titulo: TIPO_AUDIENCIA_LABEL[audiencia.tipo],
      cor: COR_STATUS_AUDIENCIA[audiencia.status],
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

  readonly audienciasDoDiaSelecionado = computed(() => {
    const dia = this.diaSelecionado();
    if (!dia) return [];
    return this.audienciaService.audiencias().filter((audiencia) => audiencia.data.slice(0, 10) === dia);
  });

  statusCor(status: StatusAudiencia): CorBadge {
    return COR_STATUS_AUDIENCIA[status];
  }
}
