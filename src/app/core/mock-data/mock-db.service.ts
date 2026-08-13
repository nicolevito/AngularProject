import { Injectable } from '@angular/core';
import {
  Audiencia,
  Cliente,
  Documento,
  Fatura,
  Prazo,
  Processo,
  Usuario,
} from '../models';
import { MockCollection } from './mock-collection';
import {
  AUDIENCIAS_SEED,
  CLIENTES_SEED,
  DOCUMENTOS_SEED,
  FATURAS_SEED,
  PRAZOS_SEED,
  PROCESSOS_SEED,
  USUARIOS_SEED,
} from './db';

/**
 * "Banco de dados" único do app: cada coleção é uma MockCollection independente,
 * consumida pelos serviços data-access de cada feature (ex.: ClienteService).
 * Trocar por um backend real no futuro significa reescrever apenas esses
 * serviços data-access, sem tocar nos componentes.
 */
@Injectable({ providedIn: 'root' })
export class MockDbService {
  readonly usuarios = new MockCollection<Usuario>('usuarios', USUARIOS_SEED);
  readonly clientes = new MockCollection<Cliente>('clientes', CLIENTES_SEED);
  readonly processos = new MockCollection<Processo>('processos', PROCESSOS_SEED);
  readonly prazos = new MockCollection<Prazo>('prazos', PRAZOS_SEED);
  readonly documentos = new MockCollection<Documento>('documentos', DOCUMENTOS_SEED);
  readonly audiencias = new MockCollection<Audiencia>('audiencias', AUDIENCIAS_SEED);
  readonly faturas = new MockCollection<Fatura>('faturas', FATURAS_SEED);

  /** Restaura todos os dados de demonstração ao estado inicial (seed). */
  resetarDadosDemo(): void {
    this.usuarios.reset();
    this.clientes.reset();
    this.processos.reset();
    this.prazos.reset();
    this.documentos.reset();
    this.audiencias.reset();
    this.faturas.reset();
  }
}
