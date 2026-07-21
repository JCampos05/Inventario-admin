import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import { ButtonComponent } from '../../../components/principales/button/button';
import { InputComponent } from '../../../components/principales/input/input';
import { InventoryIllustrationComponent } from '../../../components/svgs/inventory-illustration';
import { PhosphorIconComponent } from '../../../components/svgs/phosphor-icon';
import { ApiErrorResponse } from '../../../models/index.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    PhosphorIconComponent,
    InventoryIllustrationComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    password: ['', Validators.required],
  });

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    this.errorGeneral.set(null);
    this.cargando.set(true);

    const { telefono, password } = this.formulario.getRawValue();
    this.authService.login({ telefono: telefono!, password: password! }).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorGeneral.set(respuesta.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        if (error.status === 429) {
          this.errorGeneral.set('Demasiados intentos, espera unos minutos');
          return;
        }
        const cuerpo = error.error as ApiErrorResponse | undefined;
        this.errorGeneral.set(cuerpo?.message ?? 'No se pudo iniciar sesion');
      },
    });
  }
}
