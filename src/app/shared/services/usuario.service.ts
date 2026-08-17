import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../../core/models';
import { API_BASE_URL } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly _usuarios = signal<Usuario[]>([]);
  readonly usuarios = this._usuarios.asReadonly();

  constructor() {
    this.http.get<Usuario[]>(`${API_BASE_URL}/usuarios`).subscribe((lista) => this._usuarios.set(lista));
  }
}
