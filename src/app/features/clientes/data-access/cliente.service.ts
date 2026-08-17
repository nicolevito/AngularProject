import { Injectable } from '@angular/core';
import { Cliente } from '../../../core/models';
import { API_BASE_URL } from '../../../core/config/api.config';
import { HttpCollection } from '../../../shared/services/http-collection';

type ClienteDados = Omit<Cliente, 'id' | 'criadoEm'>;

@Injectable({ providedIn: 'root' })
export class ClienteService extends HttpCollection<Cliente, ClienteDados> {
  readonly clientes = this.itens;

  constructor() {
    super(`${API_BASE_URL}/clientes`);
  }
}
