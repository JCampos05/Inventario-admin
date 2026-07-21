import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../principales/button/button';
import { InputComponent } from '../../principales/input/input';
import { ToastService } from '../../principales/toast/toast.service';
import { ApiErrorResponse, ApiFieldError, CrearProveedorPayload, Proveedor } from '../../../models/index.models';
import { ProveedoresService } from '../../../services/index.services';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './proveedor-form.html',
  styleUrl: './proveedor-form.css',
})
export class ProveedorFormComponent implements OnChanges {
  @Input() proveedor: Proveedor | null = null;
  @Output() guardado = new EventEmitter<Proveedor>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly proveedoresService = inject(ProveedoresService);
  private readonly toastService = inject(ToastService);

  protected readonly guardando = signal(false);
  protected readonly errores = signal<Record<string, string>>({});

  protected readonly formulario = this.fb.group({
    nombreTienda: ['', Validators.required],
    telefono: [''],
    linkWeb: [''],
  });

  ngOnChanges(): void {
    this.cargarProveedor();
  }

  private cargarProveedor(): void {
    if (!this.proveedor) return;
    this.formulario.patchValue({
      nombreTienda: this.proveedor.nombreTienda,
      telefono: this.proveedor.telefono ?? '',
      linkWeb: this.proveedor.linkWeb ?? '',
    });
  }

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    this.errores.set({});

    if (this.formulario.invalid) {
      return;
    }

    const valores = this.formulario.getRawValue();
    const payload: CrearProveedorPayload = {
      nombreTienda: valores.nombreTienda!,
      ...(valores.telefono ? { telefono: valores.telefono } : {}),
      ...(valores.linkWeb ? { linkWeb: valores.linkWeb } : {}),
    };

    this.guardando.set(true);
    const peticion = this.proveedor
      ? this.proveedoresService.actualizar(this.proveedor.publicId, payload)
      : this.proveedoresService.crear(payload);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        if (respuesta.success) {
          this.toastService.exito(respuesta.message ?? 'Proveedor guardado correctamente');
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
