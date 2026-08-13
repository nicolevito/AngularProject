import { documentoValidator } from './documento.validator';

describe('documentoValidator', () => {
  it('aceita um CPF válido', () => {
    expect(documentoValidator({ value: '147.258.369-82' } as never)).toBeNull();
  });

  it('aceita um CNPJ válido', () => {
    expect(documentoValidator({ value: '11.223.344/0001-86' } as never)).toBeNull();
  });

  it('rejeita um CPF com dígito verificador inválido', () => {
    expect(documentoValidator({ value: '147.258.369-00' } as never)).toEqual({ documentoInvalido: true });
  });

  it('rejeita valores que não têm 11 nem 14 dígitos', () => {
    expect(documentoValidator({ value: '123.456' } as never)).toEqual({ documentoInvalido: true });
  });

  it('não reporta erro para campo vazio', () => {
    expect(documentoValidator({ value: '' } as never)).toBeNull();
  });
});
