import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** A API devolve `{ detail: string }` (erro de negócio) ou `{ detail: [{msg,...}] }` (erro de validação do Pydantic). */
function mensagemAmigavel(erro: HttpErrorResponse): string {
  const detail = erro.error?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? JSON.stringify(d)).join(' ');
  return erro.message || 'Ocorreu um erro inesperado. Tente novamente.';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token();
  const requisicao = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro) => {
      if (!(erro instanceof HttpErrorResponse)) return throwError(() => erro);

      if (erro.status === 401 && authService.isAuthenticated()) {
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => new Error(mensagemAmigavel(erro)));
    }),
  );
};
