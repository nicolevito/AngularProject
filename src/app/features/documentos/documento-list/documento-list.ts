import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { DocumentoService } from '../data-access/documento.service';
import { ProcessoService } from '../../processos/data-access/processo.service';
import { AuthService } from '../../../core/auth/auth.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { TIPO_DOCUMENTO_LABEL, TipoDocumento } from '../../../core/models';

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

@Component({
  selector: 'app-documento-list',
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    EmptyState,
  ],
  templateUrl: './documento-list.html',
  styleUrl: './documento-list.scss',
})
export class DocumentoList {
  private readonly fb = inject(FormBuilder);
  private readonly documentoService = inject(DocumentoService);
  private readonly processoService = inject(ProcessoService);
  private readonly authService = inject(AuthService);

  readonly documentos = this.documentoService.documentos;
  readonly processos = this.processoService.processos;
  readonly colunas = ['nome', 'tipo', 'processo', 'versao', 'tamanho', 'criadoEm', 'acoes'];
  readonly tiposDocumento = Object.entries(TIPO_DOCUMENTO_LABEL) as [TipoDocumento, string][];
  readonly formatarTamanho = formatarTamanho;

  readonly mostrandoFormUpload = signal(false);
  readonly arquivoSelecionado = signal<File | null>(null);
  readonly erroUpload = signal<string | null>(null);

  readonly formUpload = this.fb.nonNullable.group({
    processoId: ['', Validators.required],
    nome: ['', Validators.required],
    tipo: this.fb.nonNullable.control<TipoDocumento>('outro', Validators.required),
  });

  private readonly numeroProcessoPorId = computed(() => {
    const mapa = new Map<string, string>();
    this.processos().forEach((p) => mapa.set(p.id, p.numeroProcesso));
    return mapa;
  });

  numeroProcesso(processoId: string): string {
    return this.numeroProcessoPorId().get(processoId) ?? '—';
  }

  tipoLabel(tipo: TipoDocumento): string {
    return TIPO_DOCUMENTO_LABEL[tipo];
  }

  alternarFormUpload(): void {
    this.mostrandoFormUpload.update((v) => !v);
    this.arquivoSelecionado.set(null);
    this.erroUpload.set(null);
    this.formUpload.reset({ processoId: '', nome: '', tipo: 'outro' });
  }

  selecionarArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.arquivoSelecionado.set(arquivo);
    if (arquivo && !this.formUpload.controls.nome.value) {
      this.formUpload.controls.nome.setValue(arquivo.name);
    }
  }

  enviar(): void {
    const arquivo = this.arquivoSelecionado();
    if (this.formUpload.invalid || !arquivo) {
      this.formUpload.markAllAsTouched();
      this.erroUpload.set(!arquivo ? 'Selecione um arquivo.' : null);
      return;
    }

    const { processoId, nome, tipo } = this.formUpload.getRawValue();
    const usuarioId = this.authService.currentUser()?.id ?? '';

    this.documentoService
      .upload({ processoId, nome, tipo, tamanhoBytes: arquivo.size, uploadPor: usuarioId })
      .subscribe(() => this.alternarFormUpload());
  }

  novaVersao(documentoId: string, evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const usuarioId = this.authService.currentUser()?.id ?? '';
    this.documentoService.adicionarVersao(documentoId, usuarioId).subscribe();
    input.value = '';
  }

  excluir(id: string, nome: string): void {
    if (!confirm(`Excluir o documento "${nome}"?`)) return;
    this.documentoService.remove(id).subscribe();
  }
}
