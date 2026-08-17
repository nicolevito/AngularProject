import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from '../data-access/portal.service';
import { UsuarioService } from '../../../shared/services/usuario.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import {
  AREA_DIREITO_LABEL,
  Processo,
  STATUS_PROCESSO_LABEL,
  StatusProcesso,
  TipoAndamento,
} from '../../../core/models';

const COR_STATUS: Record<StatusProcesso, CorBadge> = {
  ativo: 'sucesso',
  suspenso: 'aviso',
  arquivado: 'neutro',
  encerrado: 'neutro',
  em_recurso: 'info',
};

const TIPO_ANDAMENTO_LABEL: Record<TipoAndamento, string> = {
  peticao: 'Petição',
  decisao: 'Decisão',
  audiencia_marcada: 'Audiência marcada',
  movimentacao: 'Movimentação',
  sentenca: 'Sentença',
  outro: 'Outro',
};

@Component({
  selector: 'app-meus-processos',
  imports: [DatePipe, MatExpansionModule, MatIconModule, EmptyState, StatusBadge],
  templateUrl: './meus-processos.html',
  styleUrl: './meus-processos.scss',
})
export class MeusProcessos {
  private readonly portalService = inject(PortalService);
  private readonly usuarioService = inject(UsuarioService);

  readonly processos = this.portalService.meusProcessos;
  readonly AREA_DIREITO_LABEL = AREA_DIREITO_LABEL;
  readonly TIPO_ANDAMENTO_LABEL = TIPO_ANDAMENTO_LABEL;

  statusLabel(status: StatusProcesso): string {
    return STATUS_PROCESSO_LABEL[status];
  }

  statusCor(status: StatusProcesso): CorBadge {
    return COR_STATUS[status];
  }

  advogadoNome(processo: Processo): string {
    return this.usuarioService.usuarios().find((u) => u.id === processo.advogadoResponsavelId)?.nome ?? '—';
  }

  andamentosOrdenados(processo: Processo) {
    return [...processo.andamentos].sort((a, b) => b.data.localeCompare(a.data));
  }
}
