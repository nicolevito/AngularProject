import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';

const DEBOUNCE_MS = 400;

export interface VerificadorNumeroProcesso {
  existeNumero(numero: string, idExcluido?: string): Observable<boolean>;
}

/** Async validator: garante que numeroProcesso seja único na base (exceto o próprio registro em edição). */
export function numeroProcessoUniqueValidator(
  service: VerificadorNumeroProcesso,
  idExcluido?: string,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return timer(DEBOUNCE_MS).pipe(
      switchMap(() => service.existeNumero(control.value, idExcluido)),
      map((existe) => (existe ? { numeroProcessoDuplicado: true } : null)),
      catchError(() => of(null)),
      first(),
    );
  };
}
