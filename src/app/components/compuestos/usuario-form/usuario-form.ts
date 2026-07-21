import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../principales/button/button';
import { InputComponent } from '../../principales/input/input';
import { OpcionSelect, SelectComponent } from '../../principales/select/select';
import { ToastService } from '../../principales/toast/toast.service';
import {
  ApiErrorResponse,
  ApiFieldError,
  CrearUsuarioPayload,
  RolUsuario,
  Usuario,
} from '../../../models/index.models';
import { UsuariosService } from '../../../services/index.services';

const OPCIONES_ROL: OpcionSelect[] = [{ value: 'ADMIN', label: 'Administrador' }];

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, SelectComponent, ButtonComponent],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioFormComponent implements OnChanges {
  @Input() usuario: Usuario | null = null;
  @Output() guardado = new EventEmitter<Usuario>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toastService = inject(ToastService);

  protected readonly guardando = signal(false);
  protected readonly errores = signal<Record<string, string>>({});
  protected readonly opcionesRol = OPCIONES_ROL;

  protected readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    password: [''],
    rol: ['ADMIN' as RolUsuario, Validators.required],
  });

  ngOnChanges(): void {
    this.cargarUsuario();
  }

  private cargarUsuario(): void {
    if (!this.usuario) return;
    this.formulario.patchValue({
      nombre: this.usuario.nombre,
      telefono: this.usuario.telefono,
      password: '',
      rol: this.usuario.rol,
    });
  }

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    this.errores.set({});

    const password = this.formulario.value.password ?? '';
    if (!this.usuario && password.length < 8) {
      this.errores.set({ password: 'La password debe tener al menos 8 caracteres' });
      return;
    }
    if (password && password.length < 8) {
      this.errores.set({ password: 'La password debe tener al menos 8 caracteres' });
      return;
    }

    if (this.formulario.invalid) {
      return;
    }

    const valores = this.formulario.getRawValue();
    const payload: CrearUsuarioPayload = {
      nombre: valores.nombre!,
      telefono: valores.telefono!,
      password: valores.password || '',
      rol: valores.rol as RolUsuario,
    };

    this.guardando.set(true);
    const peticion = this.usuario
      ? this.usuariosService.actualizar(this.usuario.publicId, {
          nombre: payload.nombre,
          telefono: payload.telefono,
          rol: payload.rol,
          ...(valores.password ? { password: valores.password } : {}),
        })
      : this.usuariosService.crear(payload);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        if (respuesta.success) {
          this.toastService.exito(respuesta.message ?? 'Usuario guardado correctamente');
          this.guardado.emit(respuesta.data);
        } else {
          this.aplicarErrores(respuesta);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.aplicarErrores(error.error as ApiErrorResponse | undefined);
        this.toastService.error(this.mensajeError(error));
      },
    });
  }

  private aplicarErrores(respuesta?: ApiErrorResponse): void {
    if (!respuesta?.errors) return;
    const mapa: Record<string, string> = {};
    for (const err of respuesta.errors as ApiFieldError[]) {
      const campo = String(err.path[0]);
      mapa[campo] = err.message;
    }
    this.errores.set(mapa);
  }

  private mensajeError(error: HttpErrorResponse): string {
    const cuerpo = error.error as ApiErrorResponse | undefined;
    return cuerpo?.message ?? 'Ocurrio un error inesperado';
  }
}
