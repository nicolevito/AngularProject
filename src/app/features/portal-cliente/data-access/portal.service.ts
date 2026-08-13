import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ProcessoService } from '../../processos/data-access/processo.service';
import { DocumentoService } from '../../documentos/data-access/documento.service';
import { PrazoService } from '../../prazos/data-access/prazo.service';

/**
 * Escopo os dados do portal do cliente sempre pelo clienteId do usuário logado,
 * nunca expondo processos/documentos de outros clientes.
 */
@Injectable({ providedIn: 'root' })
export class PortalService {
  private readonly authService = inject(AuthService);
  private readonly processoService = inject(ProcessoService);
  private readonly documentoService = inject(DocumentoService);
  private readonly prazoService = inject(PrazoService);

  readonly clienteId = computed(() => this.authService.currentUser()?.clienteId ?? null);

  readonly meusProcessos = computed(() => {
    const id = this.clienteId();
    if (!id) return [];
    return this.processoService.processos().filter((processo) => processo.clienteId === id);
  });

  private readonly meusProcessoIds = computed(() => new Set(this.meusProcessos().map((p) => p.id)));

  readonly meusDocumentos = computed(() =>
    this.documentoService.documentos().filter((doc) => this.meusProcessoIds().has(doc.processoId)),
  );

  readonly meusPrazos = computed(() =>
    this.prazoService.prazos().filter((prazo) => this.meusProcessoIds().has(prazo.processoId)),
  );
}
