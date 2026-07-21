import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../principales/button/button';
import { InputComponent } from '../../principales/input/input';
import { ToastService } from '../../principales/toast/toast.service';
import { ApiErrorResponse, ApiFieldError, Cliente, CrearClientePayload } from '../../../models/index.models';
import { ClientesService } from '../../../services/index.services';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteFormComponent implements OnChanges {
  @Input() cliente: Cliente | null = null;
  @Output() guardado = new EventEmitter<Cliente>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly clientesService = inject(ClientesService);
  private readonly toastService = inject(ToastService);

  protected readonly guardando = signal(false);
  protected readonly errores = signal<Record<string, string>>({});

  protected readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    telefono: [''],
    email: ['', Validators.email],
    direccion: [''],
  });

  ngOnChanges(): void {
    this.cargarCliente();
  }

  private cargarCliente(): void {
    if (!this.cliente) return;
    this.formulario.patchValue({
      nombre: this.cliente.nombre,
      telefono: this.cliente.telefono ?? '',
      email: this.cliente.email ?? '',
      direccion: this.cliente.direccion ?? '',
    });
  }

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    this.errores.set({});

    if (this.formulario.invalid) {
      return;
    }

    const valores = this.formulario.getRawValue();
    const payload: CrearClientePayload = {
      nombre: valores.nombre!,
      ...(valores.telefono ? { telefono: valores.telefono } : {}),
      ...(valores.email ? { email: valores.email } : {}),
      ...(valores.direccion ? { direccion: valores.direccion } : {}),
    };

    this.guardando.set(true);
    const peticion = this.cliente
      ? this.clientesService.actualizar(this.cliente.publicId, payload)
      : this.clientesService.crear(payload);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        if (respuesta.success) {
          this.toastService.exito(respuesta.message ?? 'Cliente guardado correctamente');
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
