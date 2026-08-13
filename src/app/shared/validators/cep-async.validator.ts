import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { CepLookupService } from '../services/cep-lookup.service';

const DEBOUNCE_MS = 400;

/** Async validator: confirma que o CEP existe na base simulada antes de liberar o campo. */
export function cepAsyncValidator(cepLookup: CepLookupService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const cep = (control.value as string | null)?.replace(/\D/g, '') ?? '';
    if (cep.length !== 8) return of(null);

    return timer(DEBOUNCE_MS).pipe(
      switchMap(() => cepLookup.existe(cep)),
      map((existe) => (existe ? null : { cepNaoEncontrado: true })),
      catchError(() => of(null)),
      first(),
    );
  };
}
