import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from '../data-access/portal.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { TIPO_DOCUMENTO_LABEL, TipoDocumento } from '../../../core/models';

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

@Component({
  selector: 'app-meus-documentos',
  imports: [DatePipe, MatTableModule, MatIconModule, EmptyState],
  templateUrl: './meus-documentos.html',
  styleUrl: './meus-documentos.scss',
})
export class MeusDocumentos {
  private readonly portalService = inject(PortalService);

  readonly documentos = this.portalService.meusDocumentos;
  readonly colunas = ['nome', 'tipo', 'processo', 'versao', 'tamanho', 'criadoEm'];
  readonly formatarTamanho = formatarTamanho;

  private readonly numeroProcessoPorId = computed(() => {
    const mapa = new Map<string, string>();
    this.portalService.meusProcessos().forEach((p) => mapa.set(p.id, p.numeroProcesso));
    return mapa;
  });

  numeroProcesso(processoId: string): string {
    return this.numeroProcessoPorId().get(processoId) ?? '—';
  }

  tipoLabel(tipo: TipoDocumento): string {
    return TIPO_DOCUMENTO_LABEL[tipo];
  }
}
