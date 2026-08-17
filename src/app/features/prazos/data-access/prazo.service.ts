import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Prazo } from '../../../core/models';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpCollection } from '../../../shared/services/http-collection';

type PrazoDados = Omit<Prazo, 'id'>;

@Injectable({ providedIn: 'root' })
export class PrazoService extends HttpCollection<Prazo, PrazoDados> {
  readonly prazos = this.itens;

  constructor() {
    super(`${API_BASE_URL}/prazos`);
  }

  concluir(id: string): Observable<Prazo> {
    return this.http.post<Prazo>(`${this.url}/${id}/concluir`, {}).pipe(tap(() => this.recarregar()));
  }
}
