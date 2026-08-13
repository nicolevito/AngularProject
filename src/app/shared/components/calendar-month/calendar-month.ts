import { Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CorBadge } from '../status-badge/status-badge';

export interface EventoCalendario {
  data: string;
  titulo: string;
  cor?: CorBadge;
}

interface DiaGrade {
  data: Date;
  chave: string;
  numero: number;
  noMesAtual: boolean;
  hoje: boolean;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MAX_EVENTOS_VISIVEIS = 3;

function chaveData(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-calendar-month',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './calendar-month.html',
  styleUrl: './calendar-month.scss',
})
export class CalendarMonth {
  readonly eventos = input<EventoCalendario[]>([]);
  readonly diaSelecionado = output<string>();

  private readonly hoje = new Date();
  readonly mesReferencia = signal(new Date(this.hoje.getFullYear(), this.hoje.getMonth(), 1));

  readonly rotuloMes = computed(() => {
    const ref = this.mesReferencia();
    return `${MESES[ref.getMonth()]} ${ref.getFullYear()}`;
  });

  readonly diasSemana = DIAS_SEMANA;

  private readonly eventosPorDia = computed(() => {
    const mapa = new Map<string, EventoCalendario[]>();
    for (const evento of this.eventos()) {
      const chave = evento.data.slice(0, 10);
      const lista = mapa.get(chave) ?? [];
      lista.push(evento);
      mapa.set(chave, lista);
    }
    return mapa;
  });

  readonly semanas = computed(() => {
    const ref = this.mesReferencia();
    const primeiroDiaMes = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const inicioGrade = new Date(primeiroDiaMes);
    inicioGrade.setDate(inicioGrade.getDate() - primeiroDiaMes.getDay());

    const dias: DiaGrade[] = [];
    const cursor = new Date(inicioGrade);
    for (let i = 0; i < 42; i++) {
      dias.push({
        data: new Date(cursor),
        chave: chaveData(cursor),
        numero: cursor.getDate(),
        noMesAtual: cursor.getMonth() === ref.getMonth(),
        hoje: chaveData(cursor) === chaveData(this.hoje),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const semanas: DiaGrade[][] = [];
    for (let i = 0; i < dias.length; i += 7) {
      semanas.push(dias.slice(i, i + 7));
    }
    return semanas;
  });

  eventosDoDia(chave: string): EventoCalendario[] {
    return this.eventosPorDia().get(chave) ?? [];
  }

  eventosVisiveis(chave: string): EventoCalendario[] {
    return this.eventosDoDia(chave).slice(0, MAX_EVENTOS_VISIVEIS);
  }

  eventosExtras(chave: string): number {
    return Math.max(0, this.eventosDoDia(chave).length - MAX_EVENTOS_VISIVEIS);
  }

  mesAnterior(): void {
    const ref = this.mesReferencia();
    this.mesReferencia.set(new Date(ref.getFullYear(), ref.getMonth() - 1, 1));
  }

  proximoMes(): void {
    const ref = this.mesReferencia();
    this.mesReferencia.set(new Date(ref.getFullYear(), ref.getMonth() + 1, 1));
  }

  mesAtual(): void {
    this.mesReferencia.set(new Date(this.hoje.getFullYear(), this.hoje.getMonth(), 1));
  }

  selecionarDia(chave: string): void {
    this.diaSelecionado.emit(chave);
  }
}
