import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Usuario } from '../models';
import { API_BASE_URL } from '../config/api.config';

const TOKEN_STORAGE_KEY = 'escritorio-advocacia:token';
const USUARIO_STORAGE_KEY = 'escritorio-advocacia:usuario';

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  usuario: Usuario;
}

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(this.restaurarToken());
  readonly currentUser = signal<Usuario | null>(this.restaurarUsuario());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  private restaurarToken(): string | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token || tokenExpirado(token)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USUARIO_STORAGE_KEY);
      return null;
    }
    return token;
  }

  private restaurarUsuario(): Usuario | null {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return null;
    const bruto = localStorage.getItem(USUARIO_STORAGE_KEY);
    return bruto ? (JSON.parse(bruto) as Usuario) : null;
  }

  login(email: string, senha: string): Observable<Usuario> {
    return this.http
      .post<TokenResponse>(`${API_BASE_URL}/auth/login`, { email, senha })
      .pipe(
        tap((resposta) => this.definirSessao(resposta)),
        map((resposta) => resposta.usuario),
      );
  }

  loginRapido(role: Usuario['role']): Observable<Usuario> {
    return this.http
      .post<TokenResponse>(`${API_BASE_URL}/auth/login-rapido`, { role })
      .pipe(
        tap((resposta) => this.definirSessao(resposta)),
        map((resposta) => resposta.usuario),
      );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USUARIO_STORAGE_KEY);
  }

  private definirSessao(resposta: TokenResponse): void {
    this.token.set(resposta.accessToken);
    this.currentUser.set(resposta.usuario);
    localStorage.setItem(TOKEN_STORAGE_KEY, resposta.accessToken);
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(resposta.usuario));
  }
}
