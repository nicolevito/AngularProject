import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Fatura } from '../../../core/models';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpCollection } from '../../../shared/services/http-collection';

type FaturaDados = Omit<Fatura, 'id'>;

@Injectable({ providedIn: 'root' })
export class FaturaService extends HttpCollection<Fatura, FaturaDados> {
  readonly faturas = this.itens;

  constructor() {
    super(`${API_BASE_URL}/faturas`);
  }

  marcarPaga(id: string, formaPagamento: Fatura['formaPagamento']): Observable<Fatura> {
    return this.http
      .post<Fatura>(`${this.url}/${id}/marcar-paga`, { formaPagamento })
      .pipe(tap(() => this.recarregar()));
  }

  cancelar(id: string): Observable<Fatura> {
    return this.http.post<Fatura>(`${this.url}/${id}/cancelar`, {}).pipe(tap(() => this.recarregar()));
  }
}
