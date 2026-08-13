import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models';

/** `*appHasRole="['advogado']"` — renderiza o conteúdo só se o usuário logado tiver um dos papéis informados. */
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly appHasRole = input.required<Role[]>();

  constructor() {
    effect(() => {
      const role = this.authService.role();
      this.viewContainer.clear();
      if (role && this.appHasRole().includes(role)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
