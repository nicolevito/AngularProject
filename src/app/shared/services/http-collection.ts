import { inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Base para os services de data-access: mantém um Signal<T[]> alimentado via HTTP,
 * recarregando a lista após cada mutação. Espelha a forma pública que o antigo
 * MockCollection já expunha, para os componentes que leem `service.itens()` não
 * precisarem mudar.
 */
export abstract class HttpCollection<T extends { id: string }, TCreate = Partial<T>, TUpdate = TCreate> {
  protected readonly http = inject(HttpClient);

  private readonly _itens = signal<T[]>([]);
  readonly itens = this._itens.asReadonly();

  constructor(protected readonly url: string) {
    this.recarregar();
  }

  protected recarregar(): void {
    this.http.get<T[]>(this.url).subscribe((lista) => this._itens.set(lista));
  }

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(dados: TCreate): Observable<T> {
    return this.http.post<T>(this.url, dados).pipe(tap(() => this.recarregar()));
  }

  update(id: string, dados: TUpdate): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, dados).pipe(tap(() => this.recarregar()));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(tap(() => this.recarregar()));
  }
}
