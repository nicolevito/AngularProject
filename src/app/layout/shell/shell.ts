import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, MatSidenavModule, Sidebar, Topbar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly ehMobile = toSignal(this.breakpointObserver.observe(Breakpoints.Handset), {
    initialValue: { matches: false, breakpoints: {} },
  });

  private readonly sidenavAbertoManual = signal(false);

  /** No mobile o sidenav começa fechado (modo overlay); no desktop fica sempre visível. */
  readonly sidenavAberto = computed(() => (this.ehMobile().matches ? this.sidenavAbertoManual() : true));
  readonly modoSidenav = computed(() => (this.ehMobile().matches ? 'over' : 'side'));

  alternarSidenav(): void {
    this.sidenavAbertoManual.update((aberto) => !aberto);
  }

  fecharSidenavMobile(): void {
    this.sidenavAbertoManual.set(false);
  }
}
