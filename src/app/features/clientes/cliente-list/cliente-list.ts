import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../data-access/cliente.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import { CpfCnpjPipe } from '../../../shared/pipes/cpf-cnpj.pipe';
import { documentoCliente, nomeExibicaoCliente, STATUS_CLIENTE_LABEL, StatusCliente } from '../../../core/models';

const COR_STATUS: Record<StatusCliente, CorBadge> = {
  ativo: 'sucesso',
  inativo: 'neutro',
};

@Component({
  selector: 'app-cliente-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTooltipModule,
    EmptyState,
    StatusBadge,
    CpfCnpjPipe,
  ],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.scss',
})
export class ClienteList {
  private readonly clienteService = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);

  readonly clientes = this.clienteService.clientes;
  readonly busca = signal('');
  readonly statusFiltro = signal<StatusCliente | ''>(this.statusInicialDaRota());
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(5);

  readonly colunas = ['nome', 'tipo', 'documento', 'contato', 'cidade', 'status', 'acoes'];
  readonly statusOpcoes = Object.entries(STATUS_CLIENTE_LABEL) as [StatusCliente, string][];

  readonly nomeExibicaoCliente = nomeExibicaoCliente;
  readonly documentoCliente = documentoCliente;

  private statusInicialDaRota(): StatusCliente | '' {
    const status = this.route.snapshot.queryParamMap.get('status');
    return status === 'ativo' || status === 'inativo' ? status : '';
  }

  statusLabel(status: StatusCliente): string {
    return STATUS_CLIENTE_LABEL[status];
  }

  statusCor(status: StatusCliente): CorBadge {
    return COR_STATUS[status];
  }

  readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const status = this.statusFiltro();
    return this.clientes().filter((cliente) => {
      if (status && cliente.status !== status) return false;
      if (!termo) return true;
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

  filtrarStatus(status: StatusCliente | ''): void {
    this.statusFiltro.set(status);
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
