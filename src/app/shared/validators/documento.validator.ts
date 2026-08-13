import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { cpfValido } from './cpf.validator';
import { cnpjValido } from './cnpj.validator';

/** Aceita CPF ou CNPJ, detectando o formato pela quantidade de dígitos. */
export const documentoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value as string | null;
  if (!valor) return null;

  const digitos = valor.replace(/\D/g, '');
  if (digitos.length === 11) return cpfValido(valor) ? null : { documentoInvalido: true };
  if (digitos.length === 14) return cnpjValido(valor) ? null : { documentoInvalido: true };
  return { documentoInvalido: true };
};
