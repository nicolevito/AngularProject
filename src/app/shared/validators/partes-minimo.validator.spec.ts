import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { partesMinimoValidator } from './partes-minimo.validator';

function criarParte(tipo: string): FormGroup {
  return new FormGroup({ tipo: new FormControl(tipo) });
}

function criarArray(tipos: string[]): FormArray {
  return new FormArray(tipos.map(criarParte), partesMinimoValidator);
}

describe('partesMinimoValidator', () => {
  it('não reporta erro quando há ao menos um autor e um réu', () => {
    const array = criarArray(['autor', 'reu']);
    expect(array.errors).toBeNull();
  });

  it('reporta { semAutorOuReu: true } quando falta um réu', () => {
    const array = criarArray(['autor', 'terceiro_interessado']);
    expect(array.errors).toEqual({ semAutorOuReu: true });
  });

  it('reporta { semAutorOuReu: true } quando falta um autor', () => {
    const array = criarArray(['reu']);
    expect(array.errors).toEqual({ semAutorOuReu: true });
  });

  it('reporta erro para um array vazio', () => {
    const array = criarArray([]);
    expect(array.errors).toEqual({ semAutorOuReu: true });
  });
});
