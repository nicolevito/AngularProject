import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function calcularDigitoCnpj(base: string, pesos: number[]): number {
  const total = base
    .split('')
    .reduce((soma, char, i) => soma + Number(char) * pesos[i], 0);
  const resto = total % 11;
  return resto < 2 ? 0 : 11 - resto;
}

const PESOS_DIGITO_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_DIGITO_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function cnpjValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, '');
  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) return false;

  const digito1 = calcularDigitoCnpj(digitos.slice(0, 12), PESOS_DIGITO_1);
  const digito2 = calcularDigitoCnpj(digitos.slice(0, 12) + digito1, PESOS_DIGITO_2);
  return digito1 === Number(digitos[12]) && digito2 === Number(digitos[13]);
}

export const cnpjValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return cnpjValido(control.value) ? null : { cnpjInvalido: true };
};
