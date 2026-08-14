import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../data-access/cliente.service';
import { MockDbService } from '../../../core/mock-data/mock-db.service';
import { CpfCnpjPipe } from '../../../shared/pipes/cpf-cnpj.pipe';
import { StatusBadge, CorBadge } from '../../../shared/components/status-badge/status-badge';
import {
  AREA_DIREITO_LABEL,
  documentoCliente,
  nomeExibicaoCliente,
  STATUS_CLIENTE_LABEL,
  STATUS_PROCESSO_LABEL,
  StatusCliente,
} from '../../../core/models';

const COR_STATUS_CLIENTE: Record<StatusCliente, CorBadge> = {
  ativo: 'sucesso',
  inativo: 'neutro',
};

@Component({
  selector: 'app-cliente-detail',
  imports: [RouterLink, DatePipe, MatCardModule, MatButtonModule, MatIconModule, CpfCnpjPipe, StatusBadge],
  templateUrl: './cliente-detail.html',
  styleUrl: './cliente-detail.scss',
})
export class ClienteDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly mockDb = inject(MockDbService);
  private readonly snackBar = inject(MatSnackBar);

  readonly clienteId = this.route.snapshot.paramMap.get('id')!;
  readonly cliente = toSignal(this.clienteService.getById(this.clienteId));

  readonly processos = computed(() =>
    this.mockDb.processos.items().filter((processo) => processo.clienteId === this.clienteId),
  );

  readonly nomeExibicaoCliente = nomeExibicaoCliente;
  readonly documentoCliente = documentoCliente;
  readonly STATUS_PROCESSO_LABEL = STATUS_PROCESSO_LABEL;
  readonly STATUS_CLIENTE_LABEL = STATUS_CLIENTE_LABEL;
  readonly AREA_DIREITO_LABEL = AREA_DIREITO_LABEL;

  statusCor(status: StatusCliente): CorBadge {
    return COR_STATUS_CLIENTE[status];
  }

  excluir(): void {
    const cliente = this.cliente();
    if (!cliente) return;
    if (!confirm(`Excluir o cliente "${nomeExibicaoCliente(cliente)}"? Esta ação não pode ser desfeita.`)) return;

    this.clienteService.remove(this.clienteId).subscribe({
      next: () => {
        this.snackBar.open('Cliente excluído.', 'Fechar', { duration: 3000 });
        this.router.navigateByUrl('/clientes');
      },
      error: (err: Error) => this.snackBar.open(err.message, 'Fechar', { duration: 5000 }),
    });
  }
}
