import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { FaturaService } from '../data-access/fatura.service';
import { ClienteService } from '../../clientes/data-access/cliente.service';
import { ProcessoService } from '../../processos/data-access/processo.service';
import { nomeExibicaoCliente } from '../../../core/models';

function numeroSugerido(): string {
  const ano = new Date().getFullYear();
  const aleatorio = Math.floor(1000 + Math.random() * 9000);
  return `NF-${ano}-${aleatorio}`;
}

@Component({
  selector: 'app-fatura-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './fatura-form.html',
  styleUrl: './fatura-form.scss',
})
export class FaturaForm {
  private readonly fb = inject(FormBuilder);
  private readonly faturaService = inject(FaturaService);
  private readonly clienteService = inject(ClienteService);
  private readonly processoService = inject(ProcessoService);
  private readonly router = inject(Router);

  readonly clientes = this.clienteService.clientes;
  readonly processos = this.processoService.processos;
  readonly nomeExibicaoCliente = nomeExibicaoCliente;

  private readonly hoje = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.nonNullable.group({
    numero: [numeroSugerido(), Validators.required],
    clienteId: ['', Validators.required],
    processoId: [''],
    dataEmissao: [this.hoje, Validators.required],
    dataVencimento: ['', Validators.required],
    itens: this.fb.array([this.criarItemGroup()]),
  });

  get itens() {
    return this.form.controls.itens;
  }

  private criarItemGroup(descricao = '', valor: number | null = null) {
    return this.fb.nonNullable.group({
      descricao: [descricao, Validators.required],
      valor: this.fb.nonNullable.control<number | null>(valor, [Validators.required, Validators.min(0.01)]),
    });
  }

  adicionarItem(): void {
    this.itens.push(this.criarItemGroup());
  }

  removerItem(indice: number): void {
    if (this.itens.length <= 1) return;
    this.itens.removeAt(indice);
  }

  totalAtual(): number {
    return this.itens.controls.reduce((soma, grupo) => soma + (grupo.getRawValue().valor ?? 0), 0);
  }

  submeter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.faturaService
      .create({
        numero: valores.numero,
        clienteId: valores.clienteId,
        processoId: valores.processoId || undefined,
        dataEmissao: valores.dataEmissao,
        dataVencimento: valores.dataVencimento,
        itens: valores.itens.map((item) => ({ descricao: item.descricao, valor: item.valor ?? 0 })),
        valorTotal: this.totalAtual(),
        status: 'pendente',
      })
      .subscribe(() => this.router.navigateByUrl('/financeiro'));
  }
}
