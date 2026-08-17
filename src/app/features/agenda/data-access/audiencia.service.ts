import { Injectable } from '@angular/core';
import { Audiencia } from '../../../core/models';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpCollection } from '../../../shared/services/http-collection';

type AudienciaDados = Omit<Audiencia, 'id'>;

@Injectable({ providedIn: 'root' })
export class AudienciaService extends HttpCollection<Audiencia, AudienciaDados> {
  readonly audiencias = this.itens;

  constructor() {
    super(`${API_BASE_URL}/audiencias`);
  }
}
