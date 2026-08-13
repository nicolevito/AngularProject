import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../models';
import { MockDbService } from '../mock-data/mock-db.service';
import { simulateMutation } from '../mock-data/mock-http.util';

const SESSION_STORAGE_KEY = 'escritorio-advocacia:sessao';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly mockDb = inject(MockDbService);

  readonly currentUser = signal<Usuario | null>(this.restaurarSessao());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  private restaurarSessao(): Usuario | null {
    const usuarioId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!usuarioId) return null;
    return this.mockDb.usuarios.items().find((u) => u.id === usuarioId) ?? null;
  }

  login(email: string, senha: string): Observable<Usuario> {
    return simulateMutation(() => {
      const usuario = this.mockDb.usuarios
        .items()
        .find((u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha && u.ativo);
      if (!usuario) throw new Error('E-mail ou senha inválidos.');
      return usuario;
    }).pipe(tap((usuario) => this.definirSessao(usuario)));
  }

  loginRapido(role: Usuario['role']): Observable<Usuario> {
    return simulateMutation(() => {
      const usuario = this.mockDb.usuarios.items().find((u) => u.role === role && u.ativo);
      if (!usuario) throw new Error(`Nenhum usuário demo com papel "${role}".`);
      return usuario;
    }).pipe(tap((usuario) => this.definirSessao(usuario)));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  private definirSessao(usuario: Usuario): void {
    this.currentUser.set(usuario);
    localStorage.setItem(SESSION_STORAGE_KEY, usuario.id);
  }
}
