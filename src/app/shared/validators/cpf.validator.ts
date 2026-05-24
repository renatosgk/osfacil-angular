import { AbstractControl, ValidationErrors } from '@angular/forms';

function calcularDigito(digits: string, pesoInicial: number): number {
  let sum = 0;
  for (let i = 0; i < pesoInicial - 1; i++) {
    sum += parseInt(digits[i]) * (pesoInicial - i);
  }
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

export function cpfValido(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // todos iguais (ex: 111.111.111-11)
  if (parseInt(digits[9]) !== calcularDigito(digits, 10)) return false;
  if (parseInt(digits[10]) !== calcularDigito(digits, 11)) return false;
  return true;
}

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null; // deixa o required cuidar do campo vazio
  return cpfValido(value) ? null : { cpfInvalido: true };
}
