import { cpfValidator, cpfValido } from './cpf.validator';

describe('cpfValido', () => {
  it('aceita um CPF válido, formatado ou não', () => {
    expect(cpfValido('147.258.369-82')).toBe(true);
    expect(cpfValido('14725836982')).toBe(true);
  });

  it('rejeita um CPF com dígito verificador incorreto', () => {
    expect(cpfValido('147.258.369-00')).toBe(false);
  });

  it('rejeita CPFs com todos os dígitos iguais', () => {
    expect(cpfValido('111.111.111-11')).toBe(false);
  });

  it('rejeita valores com quantidade errada de dígitos', () => {
    expect(cpfValido('123')).toBe(false);
  });
});

describe('cpfValidator', () => {
  it('não reporta erro para campo vazio (delega ao Validators.required)', () => {
    expect(cpfValidator({ value: '' } as never)).toBeNull();
  });

  it('retorna null para CPF válido', () => {
    expect(cpfValidator({ value: '147.258.369-82' } as never)).toBeNull();
  });

  it('retorna { cpfInvalido: true } para CPF inválido', () => {
    expect(cpfValidator({ value: '111.111.111-11' } as never)).toEqual({ cpfInvalido: true });
  });
});
