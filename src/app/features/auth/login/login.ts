import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { rotaInicialPorRole } from '../../../core/auth/role.guard';
import { Role, Usuario } from '../../../core/models';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  readonly loginsRapidos: { role: Role; label: string; icone: string }[] = [
    { role: 'advogado', label: 'Entrar como Advogado', icone: 'gavel' },
    { role: 'estagiario', label: 'Entrar como Estagiário', icone: 'school' },
    { role: 'cliente', label: 'Entrar como Cliente', icone: 'person' },
  ];

  submeter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, senha } = this.form.getRawValue();
    this.autenticar(this.authService.login(email, senha));
  }

  entrarRapido(role: Role): void {
    this.autenticar(this.authService.loginRapido(role));
  }

  private autenticar(login$: ReturnType<AuthService['login']>): void {
    this.carregando.set(true);
    this.erro.set(null);
    login$.subscribe({
      next: (usuario: Usuario) => {
        this.carregando.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || rotaInicialPorRole(usuario.role));
      },
      error: (err: Error) => {
        this.carregando.set(false);
        this.erro.set(err.message);
      },
    });
  }
}
