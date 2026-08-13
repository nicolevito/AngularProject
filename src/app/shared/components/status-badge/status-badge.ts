import { Component, input } from '@angular/core';

export type CorBadge = 'neutro' | 'info' | 'sucesso' | 'aviso' | 'perigo';

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  readonly texto = input.required<string>();
  readonly cor = input<CorBadge>('neutro');
}
