import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../data-access/cliente.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { CpfCnpjPipe } from '../../../shared/pipes/cpf-cnpj.pipe';
import { documentoCliente, nomeExibicaoCliente } from '../../../core/models';

@Component({
  selector: 'app-cliente-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTooltipModule,
    EmptyState,
    CpfCnpjPipe,
  ],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.scss',
})
export class ClienteList {
  private readonly clienteService = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);

  readonly clientes = this.clienteService.clientes;
  readonly busca = signal('');
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(5);

  readonly colunas = ['nome', 'tipo', 'documento', 'contato', 'cidade', 'acoes'];

  readonly nomeExibicaoCliente = nomeExibicaoCliente;
  readonly documentoCliente = documentoCliente;

  readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    if (!termo) return this.clientes();
    return this.clientes().filter((cliente) => {
      const nome = nomeExibicaoCliente(cliente).toLowerCase();
      const documento = documentoCliente(cliente).toLowerCase();
      return nome.includes(termo) || documento.includes(termo) || cliente.email.toLowerCase().includes(termo);
    });
  });

  readonly paginados = computed(() => {
    const inicio = this.pagina() * this.tamanhoPagina();
    return this.filtrados().slice(inicio, inicio + this.tamanhoPagina());
  });

  buscar(termo: string): void {
    this.busca.set(termo);
    this.pagina.set(0);
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
  }

  excluir(id: string, nome: string): void {
    if (!confirm(`Excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) return;

    this.clienteService.remove(id).subscribe({
      next: () => this.snackBar.open('Cliente excluído.', 'Fechar', { duration: 3000 }),
      error: (err: Error) => this.snackBar.open(err.message, 'Fechar', { duration: 5000 }),
    });
  }
}
