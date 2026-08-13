import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function calcularDigitoCpf(base: string, fatorInicial: number): number {
  let total = 0;
  let fator = fatorInicial;
  for (const char of base) {
    total += Number(char) * fator--;
  }
  const resto = (total * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function cpfValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, '');
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  const digito1 = calcularDigitoCpf(digitos.slice(0, 9), 10);
  const digito2 = calcularDigitoCpf(digitos.slice(0, 9) + digito1, 11);
  return digito1 === Number(digitos[9]) && digito2 === Number(digitos[10]);
}

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return cpfValido(control.value) ? null : { cpfInvalido: true };
};
