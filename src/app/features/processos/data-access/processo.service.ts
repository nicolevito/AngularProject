import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Andamento, Processo } from '../../../core/models';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpCollection } from '../../../shared/services/http-collection';
import { VerificadorNumeroProcesso } from '../../../shared/validators/numero-processo-unique.validator';

type ProcessoDados = Omit<Processo, 'id'>;

@Injectable({ providedIn: 'root' })
export class ProcessoService extends HttpCollection<Processo, ProcessoDados> implements VerificadorNumeroProcesso {
  readonly processos = this.itens;

  constructor() {
    super(`${API_BASE_URL}/processos`);
  }

  existeNumero(numero: string, idExcluido?: string): Observable<boolean> {
    const params: Record<string, string> = { numero };
    if (idExcluido) params['excluir_id'] = idExcluido;
    return this.http
      .get<{ existe: boolean }>(`${this.url}/verificar-numero`, { params })
      .pipe(map((resposta) => resposta.existe));
  }

  adicionarAndamento(processoId: string, andamento: Omit<Andamento, 'id'>): Observable<Processo> {
    return this.http
      .post<Processo>(`${this.url}/${processoId}/andamentos`, andamento)
      .pipe(tap(() => this.recarregar()));
  }
}
