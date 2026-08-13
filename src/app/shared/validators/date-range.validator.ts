import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador cross-field genérico: garante que o valor de `depoisDeControlName`
 * seja uma data posterior (ou igual) à de `antesDeControlName`, ambos no mesmo FormGroup.
 */
export function dateRangeValidator(antesDeControlName: string, depoisDeControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const antes = group.get(antesDeControlName)?.value;
    const depois = group.get(depoisDeControlName)?.value;
    if (!antes || !depois) return null;

    return new Date(depois) >= new Date(antes) ? null : { dataForaDoIntervalo: true };
  };
}
