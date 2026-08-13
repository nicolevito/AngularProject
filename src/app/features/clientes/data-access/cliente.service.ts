import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Cliente } from '../../../core/models';
import { MockDbService } from '../../../core/mock-data/mock-db.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly mockDb = inject(MockDbService);

  readonly clientes = this.mockDb.clientes.items;

  list(): Observable<Cliente[]> {
    return this.mockDb.clientes.list();
  }

  getById(id: string): Observable<Cliente | undefined> {
    return this.mockDb.clientes.getById(id);
  }

  create(dados: Omit<Cliente, 'id' | 'criadoEm'>): Observable<Cliente> {
    return this.mockDb.clientes.create({ ...dados, criadoEm: new Date().toISOString() } as Omit<Cliente, 'id'>);
  }

  update(id: string, changes: Partial<Cliente>): Observable<Cliente> {
    return this.mockDb.clientes.update(id, changes);
  }

  remove(id: string): Observable<void> {
    return this.mockDb.processos.list().pipe(
      switchMap((processos) => {
        const possuiProcessos = processos.some((processo) => processo.clienteId === id);
        if (possuiProcessos) {
          return throwError(
            () => new Error('Este cliente possui processos vinculados e não pode ser excluído.'),
          );
        }
        return this.mockDb.clientes.remove(id);
      }),
    );
  }
}
