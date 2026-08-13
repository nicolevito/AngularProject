import { cnpjValidator, cnpjValido } from './cnpj.validator';

describe('cnpjValido', () => {
  it('aceita um CNPJ válido, formatado ou não', () => {
    expect(cnpjValido('11.223.344/0001-86')).toBe(true);
    expect(cnpjValido('11223344000186')).toBe(true);
  });

  it('rejeita um CNPJ com dígito verificador incorreto', () => {
    expect(cnpjValido('11.223.344/0001-00')).toBe(false);
  });

  it('rejeita CNPJs com todos os dígitos iguais', () => {
    expect(cnpjValido('11.111.111/1111-11')).toBe(false);
  });

  it('rejeita valores com quantidade errada de dígitos', () => {
    expect(cnpjValido('123')).toBe(false);
  });
});

describe('cnpjValidator', () => {
  it('não reporta erro para campo vazio (delega ao Validators.required)', () => {
    expect(cnpjValidator({ value: '' } as never)).toBeNull();
  });

  it('retorna null para CNPJ válido', () => {
    expect(cnpjValidator({ value: '11.223.344/0001-86' } as never)).toBeNull();
  });

  it('retorna { cnpjInvalido: true } para CNPJ inválido', () => {
    expect(cnpjValidator({ value: '11.111.111/1111-11' } as never)).toEqual({ cnpjInvalido: true });
  });
});
