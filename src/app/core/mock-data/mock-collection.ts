import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { simulateGet, simulateMutation } from './mock-http.util';

const STORAGE_PREFIX = 'escritorio-advocacia:';

/**
 * "Tabela" em memória com persistência em localStorage, simulando uma API REST
 * (latência de rede via mock-http.util) sobre uma coleção tipada.
 */
export class MockCollection<T extends { id: string }> {
  private readonly storageKey: string;
  readonly items;

  constructor(
    private readonly nome: string,
    private readonly seed: readonly T[],
  ) {
    this.storageKey = `${STORAGE_PREFIX}${this.nome}`;
    this.items = signal<T[]>(this.carregarInicial());
  }

  private carregarInicial(): T[] {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw) as T[];
      } catch {
        // dado corrompido no localStorage — cai para o seed
      }
    }
    return structuredClone(this.seed as T[]);
  }

  private persistir(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
  }

  list(): Observable<T[]> {
    return simulateGet(this.items());
  }

  getById(id: string): Observable<T | undefined> {
    return simulateGet(this.items()).pipe(map((items) => items.find((item) => item.id === id)));
  }

  create(dados: Omit<T, 'id'>): Observable<T> {
    return simulateMutation(() => {
      const novo = { ...dados, id: crypto.randomUUID() } as T;
      this.items.update((items) => [...items, novo]);
      this.persistir();
      return novo;
    });
  }

  update(id: string, changes: Partial<T>): Observable<T> {
    return simulateMutation(() => {
      let atualizado: T | undefined;
      this.items.update((items) =>
        items.map((item) => {
          if (item.id !== id) return item;
          atualizado = { ...item, ...changes };
          return atualizado;
        }),
      );
      if (!atualizado) throw new Error(`Registro ${id} não encontrado em "${this.nome}".`);
      this.persistir();
      return atualizado;
    });
  }

  remove(id: string): Observable<void> {
    return simulateMutation(() => {
      this.items.update((items) => items.filter((item) => item.id !== id));
      this.persistir();
    });
  }

  reset(): void {
    this.items.set(structuredClone(this.seed as T[]));
    this.persistir();
  }
}
