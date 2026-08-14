import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClienteService } from '../data-access/cliente.service';
import { CepLookupService } from '../../../shared/services/cep-lookup.service';
import { cpfValidator } from '../../../shared/validators/cpf.validator';
import { cnpjValidator } from '../../../shared/validators/cnpj.validator';
import { cepAsyncValidator } from '../../../shared/validators/cep-async.validator';
import { Cliente, ClientePF, ClientePJ, StatusCliente, TipoPessoa } from '../../../core/models';

const TELEFONE_PATTERN = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const CEP_PATTERN = /^\d{5}-?\d{3}$/;
const IDADE_MINIMA = 18;

function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

@Component({
  selector: 'app-cliente-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss',
})
export class ClienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly cepLookup = inject(CepLookupService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly buscandoCep = signal(false);
  readonly clienteId = this.route.snapshot.paramMap.get('id');
  readonly modoEdicao = this.clienteId !== null;

  readonly form = this.fb.nonNullable.group({
    tipo: this.fb.nonNullable.control<TipoPessoa>('fisica', Validators.required),
    status: this.fb.nonNullable.control<StatusCliente>('ativo', Validators.required),
    dadosEspecificos: this.fb.nonNullable.group({
      nome: [''],
      cpf: [''],
      dataNascimento: [''],
      profissao: [''],
      representanteLegalMenor: [''],
      razaoSocial: [''],
      nomeFantasia: [''],
      cnpj: [''],
      representanteLegal: [''],
    }),
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.pattern(TELEFONE_PATTERN)]],
    endereco: this.fb.nonNullable.group({
      cep: ['', [Validators.required, Validators.pattern(CEP_PATTERN)], [cepAsyncValidator(this.cepLookup)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', [Validators.required, Validators.maxLength(2)]],
    }),
  });

  readonly tipoAtual = toSignal(this.form.controls.tipo.valueChanges, {
    initialValue: this.form.controls.tipo.value,
  });

  get dadosEspecificos() {
    return this.form.controls.dadosEspecificos.controls;
  }

  ngOnInit(): void {
    this.configurarAlternanciaTipo();
    this.configurarBuscaCep();

    if (this.modoEdicao && this.clienteId) {
      this.clienteService.getById(this.clienteId).subscribe((cliente) => {
        if (cliente) this.preencherFormulario(cliente);
      });
    }
  }

  /** Alterna validadores obrigatórios entre os campos de PF e PJ conforme o tipo escolhido. */
  private configurarAlternanciaTipo(): void {
    this.form.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => this.aplicarValidadoresPorTipo(tipo));
    this.aplicarValidadoresPorTipo(this.form.controls.tipo.value);
  }

  private aplicarValidadoresPorTipo(tipo: TipoPessoa): void {
    const campos = this.dadosEspecificos;
    const camposPF = [campos.nome, campos.cpf, campos.dataNascimento];
    const camposPJ = [campos.razaoSocial, campos.cnpj, campos.representanteLegal];

    const [ativos, inativos] = tipo === 'fisica' ? [camposPF, camposPJ] : [camposPJ, camposPF];

    ativos.forEach((campo) => campo.setValidators(Validators.required));
    inativos.forEach((campo) => campo.clearValidators());

    campos.cpf.setValidators(tipo === 'fisica' ? [Validators.required, cpfValidator] : []);
    campos.cnpj.setValidators(tipo === 'juridica' ? [Validators.required, cnpjValidator] : []);

    this.aplicarValidadorMenorDeIdade();

    Object.values(campos).forEach((campo) => campo.updateValueAndValidity({ emitEvent: false }));
  }

  /** Se a data de nascimento indicar menor de idade, exige o campo de representante legal. */
  private aplicarValidadorMenorDeIdade(): void {
    const campos = this.dadosEspecificos;
    const ehMenor =
      this.form.controls.tipo.value === 'fisica' &&
      !!campos.dataNascimento.value &&
      calcularIdade(campos.dataNascimento.value) < IDADE_MINIMA;

    campos.representanteLegalMenor.setValidators(ehMenor ? Validators.required : []);
    campos.representanteLegalMenor.updateValueAndValidity({ emitEvent: false });
  }

  private configurarBuscaCep(): void {
    const cepControl = this.form.controls.endereco.controls.cep;
    cepControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((cep) => {
          const digitos = (cep ?? '').replace(/\D/g, '');
          if (digitos.length !== 8) return [null];
          this.buscandoCep.set(true);
          return this.cepLookup.buscar(digitos);
        }),
      )
      .subscribe((endereco) => {
        this.buscandoCep.set(false);
        if (!endereco) return;
        this.form.controls.endereco.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          uf: endereco.uf,
        });
      });

    this.form.controls.dadosEspecificos.controls.dataNascimento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.aplicarValidadorMenorDeIdade());
  }

  private preencherFormulario(cliente: Cliente): void {
    this.form.patchValue({
      tipo: cliente.tipo,
      status: cliente.status,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      dadosEspecificos:
        cliente.tipo === 'fisica'
          ? {
              nome: cliente.nome,
              cpf: cliente.cpf,
              dataNascimento: cliente.dataNascimento,
              profissao: cliente.profissao ?? '',
              representanteLegalMenor: cliente.representanteLegalMenor ?? '',
            }
          : {
              razaoSocial: cliente.razaoSocial,
              nomeFantasia: cliente.nomeFantasia ?? '',
              cnpj: cliente.cnpj,
              representanteLegal: cliente.representanteLegal,
            },
    });
  }

  private montarCliente(): Omit<ClientePF, 'id' | 'criadoEm'> | Omit<ClientePJ, 'id' | 'criadoEm'> {
    const valores = this.form.getRawValue();
    const comuns = {
      status: valores.status,
      email: valores.email,
      telefone: valores.telefone,
      endereco: valores.endereco,
    };

    if (valores.tipo === 'fisica') {
      return {
        tipo: 'fisica',
        nome: valores.dadosEspecificos.nome,
        cpf: valores.dadosEspecificos.cpf,
        dataNascimento: valores.dadosEspecificos.dataNascimento,
        profissao: valores.dadosEspecificos.profissao || undefined,
        representanteLegalMenor: valores.dadosEspecificos.representanteLegalMenor || undefined,
        ...comuns,
      } satisfies Omit<ClientePF, 'id' | 'criadoEm'>;
    }

    return {
      tipo: 'juridica',
      razaoSocial: valores.dadosEspecificos.razaoSocial,
      nomeFantasia: valores.dadosEspecificos.nomeFantasia || undefined,
      cnpj: valores.dadosEspecificos.cnpj,
      representanteLegal: valores.dadosEspecificos.representanteLegal,
      ...comuns,
    } satisfies Omit<ClientePJ, 'id' | 'criadoEm'>;
  }

  submeter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);
    const dados = this.montarCliente();
    const operacao$ =
      this.modoEdicao && this.clienteId
        ? this.clienteService.update(this.clienteId, dados)
        : this.clienteService.create(dados);

    operacao$.subscribe({
      next: (cliente) => {
        this.salvando.set(false);
        this.router.navigate(['/clientes', cliente.id]);
      },
      error: (err: Error) => {
        this.salvando.set(false);
        this.erro.set(err.message);
      },
    });
  }
}
