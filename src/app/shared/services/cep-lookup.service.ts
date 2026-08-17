import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/config/api.config';

export interface EnderecoEncontrado {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

@Injectable({ providedIn: 'root' })
export class CepLookupService {
  private readonly http = inject(HttpClient);

  buscar(cep: string): Observable<EnderecoEncontrado | null> {
    const digitos = cep.replace(/\D/g, '');
    return this.http.get<EnderecoEncontrado>(`${API_BASE_URL}/cep/${digitos}`).pipe(catchError(() => of(null)));
  }

  existe(cep: string): Observable<boolean> {
    return this.buscar(cep).pipe(map((endereco) => endereco !== null));
  }
}
