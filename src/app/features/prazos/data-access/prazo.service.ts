import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Prazo } from '../../../core/models';
import { MockDbService } from '../../../core/mock-data/mock-db.service';

@Injectable({ providedIn: 'root' })
export class PrazoService {
  private readonly mockDb = inject(MockDbService);

  readonly prazos = this.mockDb.prazos.items;

  list(): Observable<Prazo[]> {
    return this.mockDb.prazos.list();
  }

  getById(id: string): Observable<Prazo | undefined> {
    return this.mockDb.prazos.getById(id);
  }

  create(dados: Omit<Prazo, 'id'>): Observable<Prazo> {
    return this.mockDb.prazos.create(dados);
  }

  update(id: string, changes: Partial<Prazo>): Observable<Prazo> {
    return this.mockDb.prazos.update(id, changes);
  }

  remove(id: string): Observable<void> {
    return this.mockDb.prazos.remove(id);
  }

  concluir(id: string): Observable<Prazo> {
    return this.mockDb.prazos.update(id, { concluido: true, dataConclusao: new Date().toISOString() });
  }
}
