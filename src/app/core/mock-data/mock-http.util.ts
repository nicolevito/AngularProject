import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

const MIN_LATENCY_MS = 250;
const MAX_LATENCY_MS = 700;

function randomLatency(): number {
  return MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
}

/** Simula uma requisição GET: devolve o valor após uma latência de rede aleatória. */
export function simulateGet<T>(data: T): Observable<T> {
  return of(data).pipe(delay(randomLatency()));
}

/** Simula uma mutação (create/update/delete): executa `fn` após a latência simulada. */
export function simulateMutation<T>(fn: () => T): Observable<T> {
  return of(null).pipe(
    delay(randomLatency()),
    mergeMap(() => {
      try {
        return of(fn());
      } catch (err) {
        return throwError(() => err);
      }
    }),
  );
}

/** Lança um erro simulado com a probabilidade informada (0 a 1) — útil para exercitar estados de erro na UI. */
export function simulateError(chance = 0): void {
  if (chance > 0 && Math.random() < chance) {
    throw new Error('Falha simulada de rede. Tente novamente.');
  }
}
