import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Documento } from '../../../core/models';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpCollection } from '../../../shared/services/http-collection';

type DocumentoDados = Omit<Documento, 'id'>;

@Injectable({ providedIn: 'root' })
export class DocumentoService extends HttpCollection<Documento, DocumentoDados> {
  readonly documentos = this.itens;

  constructor() {
    super(`${API_BASE_URL}/documentos`);
  }

  upload(dados: {
    processoId: string;
    nome: string;
    tipo: Documento['tipo'];
    tamanhoBytes: number;
    uploadPor: string;
  }): Observable<Documento> {
    return this.http.post<Documento>(this.url, dados).pipe(tap(() => this.recarregar()));
  }

  adicionarVersao(id: string, usuarioId: string): Observable<Documento> {
    return this.http
      .post<Documento>(`${this.url}/${id}/versoes`, {}, { params: { usuario_id: usuarioId } })
      .pipe(tap(() => this.recarregar()));
  }
}
