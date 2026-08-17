import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProcessoService } from '../data-access/processo.service';
import { ClienteService } from '../../clientes/data-access/cliente.service';
import { PrazoService } from '../../prazos/data-access/prazo.service';
import { DocumentoService } from '../../documentos/data-access/documento.service';
import { UsuarioService } from '../../../shared/services/usuario.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import {
  AREA_DIREITO_LABEL,
  calcularUrgencia,
  nomeExibicaoCliente,
  STATUS_PROCESSO_LABEL,
  TipoAndamento,
} from '../../../core/models';

const TIPO_ANDAMENTO_LABEL: Record<TipoAndamento, string> = {
  peticao: 'Petição',
  decisao: 'Decisão',
  audiencia_marcada: 'Audiência marcada',
  movimentacao: 'Movimentação',
  sentenca: 'Sentença',
  outro: 'Outro',
};

@Component({
  selector: 'app-processo-detail',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    KeyValuePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    StatusBadge,
    HasRoleDirective,
  ],
  templateUrl: './processo-detail.html',
  styleUrl: './processo-detail.scss',
})
export class ProcessoDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly processoService = inject(ProcessoService);
  private readonly clienteService = inject(ClienteService);
  private readonly prazoService = inject(PrazoService);
  private readonly documentoService = inject(DocumentoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly fb = inject(FormBuilder);

  readonly processoId = this.route.snapshot.paramMap.get('id')!;
  readonly processo = computed(() => this.processoService.processos().find((p) => p.id === this.processoId));

  readonly STATUS_PROCESSO_LABEL = STATUS_PROCESSO_LABEL;
  readonly AREA_DIREITO_LABEL = AREA_DIREITO_LABEL;
  readonly TIPO_ANDAMENTO_LABEL = TIPO_ANDAMENTO_LABEL;
  readonly calcularUrgencia = calcularUrgencia;

  readonly cliente = computed(() => {
    const clienteId = this.processo()?.clienteId;
    return clienteId ? this.clienteService.clientes().find((c) => c.id === clienteId) : undefined;
  });

  readonly nomeCliente = computed(() => {
    const cliente = this.cliente();
    return cliente ? nomeExibicaoCliente(cliente) : '—';
  });

  readonly advogado = computed(() =>
    this.usuarioService.usuarios().find((u) => u.id === this.processo()?.advogadoResponsavelId),
  );

  readonly andamentosOrdenados = computed(() =>
    [...(this.processo()?.andamentos ?? [])].sort((a, b) => b.data.localeCompare(a.data)),
  );

  readonly prazos = computed(() =>
    this.prazoService.prazos().filter((prazo) => prazo.processoId === this.processoId),
  );

  readonly documentos = computed(() =>
    this.documentoService.documentos().filter((documento) => documento.processoId === this.processoId),
  );

  readonly mostrandoFormAndamento = signal(false);

  readonly formAndamento = this.fb.nonNullable.group({
    tipo: this.fb.nonNullable.control<TipoAndamento>('movimentacao', Validators.required),
    descricao: ['', Validators.required],
  });

  alternarFormAndamento(): void {
    this.mostrandoFormAndamento.update((v) => !v);
  }

  adicionarAndamento(): void {
    if (this.formAndamento.invalid) {
      this.formAndamento.markAllAsTouched();
      return;
    }
    const { tipo, descricao } = this.formAndamento.getRawValue();
    this.processoService
      .adicionarAndamento(this.processoId, {
        data: new Date().toISOString().slice(0, 10),
        descricao,
        tipo,
        autorId: this.processo()?.advogadoResponsavelId ?? '',
      })
      .subscribe(() => {
        this.formAndamento.reset({ tipo: 'movimentacao', descricao: '' });
        this.mostrandoFormAndamento.set(false);
      });
  }
}
