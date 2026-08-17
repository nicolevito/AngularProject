import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth/auth.service';
import { AdminService } from '../../shared/services/admin.service';

const ROLE_LABEL: Record<string, string> = {
  advogado: 'Advogado(a)',
  estagiario: 'Estagiário(a)',
  cliente: 'Cliente',
};

@Component({
  selector: 'app-topbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly abrirMenu = output<void>();

  readonly usuario = this.authService.currentUser;
  readonly roleLabel = () => ROLE_LABEL[this.authService.role() ?? ''] ?? '';

  sair(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  resetarDados(): void {
    this.adminService.resetarDadosDemo().subscribe(() => window.location.reload());
  }
}
