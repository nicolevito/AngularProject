import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Audiencia } from '../../../core/models';
import { MockDbService } from '../../../core/mock-data/mock-db.service';

@Injectable({ providedIn: 'root' })
export class AudienciaService {
  private readonly mockDb = inject(MockDbService);

  readonly audiencias = this.mockDb.audiencias.items;

  list(): Observable<Audiencia[]> {
    return this.mockDb.audiencias.list();
  }

  getById(id: string): Observable<Audiencia | undefined> {
    return this.mockDb.audiencias.getById(id);
  }

  create(dados: Omit<Audiencia, 'id'>): Observable<Audiencia> {
    return this.mockDb.audiencias.create(dados);
  }

  update(id: string, changes: Partial<Audiencia>): Observable<Audiencia> {
    return this.mockDb.audiencias.update(id, changes);
  }

  remove(id: string): Observable<void> {
    return this.mockDb.audiencias.remove(id);
  }
}
