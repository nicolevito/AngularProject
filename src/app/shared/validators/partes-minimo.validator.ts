import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validador de FormArray: exige ao menos uma parte "autor" e uma "reu". */
export const partesMinimoValidator: ValidatorFn = (array: AbstractControl): ValidationErrors | null => {
  const partes = (array.value as { tipo: string }[]) ?? [];
  const temAutor = partes.some((parte) => parte.tipo === 'autor');
  const temReu = partes.some((parte) => parte.tipo === 'reu');

  return temAutor && temReu ? null : { semAutorOuReu: true };
};
