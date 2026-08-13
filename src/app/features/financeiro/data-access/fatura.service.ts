import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Fatura } from '../../../core/models';
import { MockDbService } from '../../../core/mock-data/mock-db.service';

@Injectable({ providedIn: 'root' })
export class FaturaService {
  private readonly mockDb = inject(MockDbService);

  readonly faturas = this.mockDb.faturas.items;

  list(): Observable<Fatura[]> {
    return this.mockDb.faturas.list();
  }

  getById(id: string): Observable<Fatura | undefined> {
    return this.mockDb.faturas.getById(id);
  }

  create(dados: Omit<Fatura, 'id'>): Observable<Fatura> {
    return this.mockDb.faturas.create(dados);
  }

  marcarPaga(id: string, formaPagamento: Fatura['formaPagamento']): Observable<Fatura> {
    return this.mockDb.faturas.update(id, {
      status: 'paga',
      dataPagamento: new Date().toISOString().slice(0, 10),
      formaPagamento,
    });
  }

  cancelar(id: string): Observable<Fatura> {
    return this.mockDb.faturas.update(id, { status: 'cancelada' });
  }

  remove(id: string): Observable<void> {
    return this.mockDb.faturas.remove(id);
  }
}
