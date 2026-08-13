import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator } from './date-range.validator';

function criarGrupo(antes: string, depois: string): FormGroup {
  return new FormGroup(
    {
      antes: new FormControl(antes),
      depois: new FormControl(depois),
    },
    dateRangeValidator('antes', 'depois'),
  );
}

describe('dateRangeValidator', () => {
  it('não reporta erro quando a data final é posterior à inicial', () => {
    const grupo = criarGrupo('2026-01-01', '2026-02-01');
    expect(grupo.errors).toBeNull();
  });

  it('não reporta erro quando as datas são iguais', () => {
    const grupo = criarGrupo('2026-01-01', '2026-01-01');
    expect(grupo.errors).toBeNull();
  });

  it('reporta { dataForaDoIntervalo: true } quando a data final é anterior à inicial', () => {
    const grupo = criarGrupo('2026-02-01', '2026-01-01');
    expect(grupo.errors).toEqual({ dataForaDoIntervalo: true });
  });

  it('não reporta erro quando algum dos campos está vazio', () => {
    const grupo = criarGrupo('', '2026-01-01');
    expect(grupo.errors).toBeNull();
  });
});
