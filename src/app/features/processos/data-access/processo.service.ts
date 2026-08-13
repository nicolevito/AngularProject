import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Andamento, Processo } from '../../../core/models';
import { MockDbService } from '../../../core/mock-data/mock-db.service';
import { VerificadorNumeroProcesso } from '../../../shared/validators/numero-processo-unique.validator';

@Injectable({ providedIn: 'root' })
export class ProcessoService implements VerificadorNumeroProcesso {
  private readonly mockDb = inject(MockDbService);

  readonly processos = this.mockDb.processos.items;

  list(): Observable<Processo[]> {
    return this.mockDb.processos.list();
  }

  getById(id: string): Observable<Processo | undefined> {
    return this.mockDb.processos.getById(id);
  }

  existeNumero(numero: string, idExcluido?: string): Observable<boolean> {
    return this.mockDb.processos.list().pipe(
      map((processos) =>
        processos.some((processo) => processo.numeroProcesso === numero && processo.id !== idExcluido),
      ),
    );
  }

  create(dados: Omit<Processo, 'id'>): Observable<Processo> {
    return this.mockDb.processos.create(dados);
  }

  update(id: string, changes: Partial<Processo>): Observable<Processo> {
    return this.mockDb.processos.update(id, changes);
  }

  remove(id: string): Observable<void> {
    return this.mockDb.processos.remove(id);
  }

  adicionarAndamento(processoId: string, andamento: Omit<Andamento, 'id'>): Observable<Processo> {
    const processo = this.mockDb.processos.items().find((p) => p.id === processoId);
    if (!processo) throw new Error(`Processo ${processoId} não encontrado.`);

    const novoAndamento: Andamento = { ...andamento, id: crypto.randomUUID() };
    return this.mockDb.processos.update(processoId, {
      andamentos: [...processo.andamentos, novoAndamento],
    });
  }
}
