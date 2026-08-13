import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessoService } from '../data-access/processo.service';
import { ClienteService } from '../../clientes/data-access/cliente.service';
import { PrazoService } from '../../prazos/data-access/prazo.service';
import { MockDbService } from '../../../core/mock-data/mock-db.service';
import { numeroProcessoUniqueValidator } from '../../../shared/validators/numero-processo-unique.validator';
import { partesMinimoValidator } from '../../../shared/validators/partes-minimo.validator';
import { documentoValidator } from '../../../shared/validators/documento.validator';
import {
  AREA_DIREITO_LABEL,
  AreaDireito,
  nomeExibicaoCliente,
  Parte,
  TIPO_PRAZO_LABEL,
  TipoParte,
  TipoPrazo,
} from '../../../core/models';

const CNJ_PATTERN = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

const dataNaoFuturaValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return new Date(control.value) <= hoje ? null : { dataFutura: true };
};

@Component({
  selector: 'app-processo-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './processo-form.html',
  styleUrl: './processo-form.scss',
})
export class ProcessoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly processoService = inject(ProcessoService);
  private readonly clienteService = inject(ClienteService);
  private readonly prazoService = inject(PrazoService);
  private readonly mockDb = inject(MockDbService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly processoId = this.route.snapshot.paramMap.get('id');
  readonly modoEdicao = this.processoId !== null;

  readonly clientes = this.clienteService.clientes;
  readonly advogados = () => this.mockDb.usuarios.items().filter((u) => u.role === 'advogado');

  readonly areas = Object.entries(AREA_DIREITO_LABEL) as [AreaDireito, string][];
  readonly tiposPrazo = Object.entries(TIPO_PRAZO_LABEL) as [TipoPrazo, string][];
  readonly nomeExibicaoCliente = nomeExibicaoCliente;

  readonly form = this.fb.nonNullable.group({
    numeroProcesso: [
      '',
      [Validators.required, Validators.pattern(CNJ_PATTERN)],
      [numeroProcessoUniqueValidator(this.processoService, this.processoId ?? undefined)],
    ],
    clienteId: ['', Validators.required],
    advogadoResponsavelId: ['', Validators.required],
    area: this.fb.nonNullable.control<AreaDireito | ''>('', Validators.required),
    vara: ['', Validators.required],
    comarca: ['', Validators.required],
    valorCausa: [0, [Validators.required, Validators.min(0)]],
    dataAbertura: ['', [Validators.required, dataNaoFuturaValidator]],
    observacoes: ['', Validators.maxLength(1000)],
    partes: this.fb.array([this.criarParteGroup('autor'), this.criarParteGroup('reu')], partesMinimoValidator),
    prazosIniciais: this.fb.array<ReturnType<ProcessoForm['criarPrazoGroup']>>([]),
  });

  get partes(): FormArray {
    return this.form.controls.partes;
  }

  get prazosIniciais(): FormArray {
    return this.form.controls.prazosIniciais;
  }

  readonly numeroProcessoStatus = toSignal(this.form.controls.numeroProcesso.statusChanges, {
    initialValue: this.form.controls.numeroProcesso.status,
  });

  private criarParteGroup(tipo: TipoParte = 'autor', parte?: Parte) {
    return this.fb.nonNullable.group({
      nome: [parte?.nome ?? '', Validators.required],
      tipo: this.fb.nonNullable.control<TipoParte>(parte?.tipo ?? tipo, Validators.required),
      documento: [parte?.documento ?? '', [Validators.required, documentoValidator]],
    });
  }

  private criarPrazoGroup() {
    return this.fb.nonNullable.group({
      titulo: ['', Validators.required],
      tipo: this.fb.nonNullable.control<TipoPrazo>('outro', Validators.required),
      dataVencimento: ['', Validators.required],
      responsavelId: ['', Validators.required],
    });
  }

  adicionarParte(): void {
    this.partes.push(this.criarParteGroup());
  }

  removerParte(indice: number): void {
    if (this.partes.length <= 2) return;
    this.partes.removeAt(indice);
  }

  adicionarPrazo(): void {
    this.prazosIniciais.push(this.criarPrazoGroup());
  }

  removerPrazo(indice: number): void {
    this.prazosIniciais.removeAt(indice);
  }

  ngOnInit(): void {
    this.configurarValidacaoPrazos();

    if (this.modoEdicao && this.processoId) {
      this.processoService.getById(this.processoId).subscribe((processo) => {
        if (!processo) return;
        this.partes.clear();
        processo.partes.forEach((parte) => this.partes.push(this.criarParteGroup(parte.tipo, parte)));

        this.form.patchValue({
          numeroProcesso: processo.numeroProcesso,
          clienteId: processo.clienteId,
          advogadoResponsavelId: processo.advogadoResponsavelId,
          area: processo.area,
          vara: processo.vara,
          comarca: processo.comarca,
          valorCausa: processo.valorCausa,
          dataAbertura: processo.dataAbertura,
          observacoes: processo.observacoes ?? '',
        });
      });
    }
  }

  /** Cada prazo inicial deve vencer em data posterior à abertura do processo (validação cross-field pai→filho). */
  private configurarValidacaoPrazos(): void {
    const revalidar = () => {
      const dataAbertura = this.form.controls.dataAbertura.value;
      this.prazosIniciais.controls.forEach((grupo) => {
        const vencimento = grupo.get('dataVencimento');
        if (!vencimento?.value || !dataAbertura) return;

        const erros = { ...vencimento.errors };
        delete erros['vencimentoAntesDaAbertura'];

        if (new Date(vencimento.value) < new Date(dataAbertura)) {
          vencimento.setErrors({ ...erros, vencimentoAntesDaAbertura: true });
        } else {
          const restante = Object.keys(erros).length ? erros : null;
          vencimento.setErrors(restante);
        }
      });
    };

    this.form.controls.dataAbertura.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(revalidar);
    this.prazosIniciais.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(revalidar);
  }

  submeter(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);
    const valores = this.form.getRawValue();

    const dadosComuns = {
      numeroProcesso: valores.numeroProcesso,
      clienteId: valores.clienteId,
      advogadoResponsavelId: valores.advogadoResponsavelId,
      area: valores.area as AreaDireito,
      vara: valores.vara,
      comarca: valores.comarca,
      valorCausa: valores.valorCausa,
      dataAbertura: valores.dataAbertura,
      observacoes: valores.observacoes || undefined,
      partes: valores.partes as Parte[],
    };

    const operacao$ = this.modoEdicao && this.processoId
      ? this.processoService.update(this.processoId, dadosComuns)
      : this.processoService.create({ ...dadosComuns, status: 'ativo', andamentos: [], documentoIds: [] });

    operacao$
      .pipe(
        switchMap((processo) => {
          if (this.modoEdicao || valores.prazosIniciais.length === 0) return of(processo);

          const criacoesPrazos = valores.prazosIniciais.map((prazo) =>
            this.prazoService.create({
              processoId: processo.id,
              titulo: prazo.titulo,
              tipo: prazo.tipo,
              dataVencimento: prazo.dataVencimento,
              responsavelId: prazo.responsavelId,
              concluido: false,
            }),
          );
          return forkJoin(criacoesPrazos).pipe(switchMap(() => of(processo)));
        }),
      )
      .subscribe({
        next: (processo) => {
          this.salvando.set(false);
          this.router.navigate(['/processos', processo.id]);
        },
        error: (err: Error) => {
          this.salvando.set(false);
          this.erro.set(err.message);
        },
      });
  }
}
