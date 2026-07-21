import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../principales/button/button';
import { InputComponent } from '../../principales/input/input';
import { SpinnerComponent } from '../../principales/spinner/spinner';
import { ToastService } from '../../principales/toast/toast.service';
import { PhosphorIconComponent } from '../../svgs/phosphor-icon';
import { ApiErrorResponse, Venta } from '../../../models/index.models';
import { VentasService } from '../../../services/index.services';

@Component({
  selector: 'app-cuenta-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SpinnerComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './cuenta-cliente.html',
  styleUrl: './cuenta-cliente.css',
})
export class CuentaClienteComponent implements OnChanges {
  @Input({ required: true }) clientePublicId!: string;

  private readonly fb = inject(FormBuilder);
  private readonly ventasService = inject(VentasService);
  private readonly toastService = inject(ToastService);

  protected readonly cargando = signal(true);
  protected readonly ventas = signal<Venta[]>([]);
  protected readonly agregando = signal(false);
  protected readonly eliminandoUltimo = signal(false);
  protected readonly exportando = signal(false);

  protected readonly formulario = this.fb.group({
    concepto: ['', Validators.required],
    debe: [0, [Validators.min(0)]],
    haber: [0, [Validators.min(0)]],
  });

  protected readonly saldoActual = computed(() => {
    const lista = this.ventas();
    return lista.length ? lista[lista.length - 1].saldo : 0;
  });

  protected readonly ultimoPublicId = computed(() => {
    const lista = this.ventas();
    return lista.length ? lista[lista.length - 1].publicId : null;
  });

  ngOnChanges(): void {
    this.cargar();
  }

  private cargar(): void {
    if (!this.clientePublicId) return;
    this.cargando.set(true);
    this.ventasService.listarPorCliente(this.clientePublicId).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.ventas.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  protected agregarMovimiento(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    const valores = this.formulario.getRawValue();
    this.agregando.set(true);
    this.ventasService
      .crear({
        clientePublicId: this.clientePublicId,
        concepto: valores.concepto!,
        debe: Number(valores.debe ?? 0),
        haber: Number(valores.haber ?? 0),
      })
      .subscribe({
        next: (respuesta) => {
          this.agregando.set(false);
          if (respuesta.success) {
            this.ventas.update((actuales) => [...actuales, respuesta.data]);
            this.formulario.reset({ concepto: '', debe: 0, haber: 0 });
            this.toastService.exito('Movimiento registrado correctamente');
          } else {
            this.toastService.error(respuesta.message);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.agregando.set(false);
          const cuerpo = error.error as ApiErrorResponse | undefined;
          this.toastService.error(cuerpo?.message ?? 'No se pudo registrar el movimiento');
        },
      });
  }

  protected eliminarUltimo(): void {
    const publicId = this.ultimoPublicId();
    if (!publicId) return;

    this.eliminandoUltimo.set(true);
    this.ventasService.eliminar(publicId).subscribe({
      next: (respuesta) => {
        this.eliminandoUltimo.set(false);
        if (respuesta.success) {
          this.ventas.update((actuales) => actuales.filter((v) => v.publicId !== publicId));
          this.toastService.exito('Movimiento eliminado correctamente');
        } else {
          this.toastService.error(respuesta.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.eliminandoUltimo.set(false);
        const cuerpo = error.error as ApiErrorResponse | undefined;
        this.toastService.error(cuerpo?.message ?? 'No se pudo eliminar el movimiento');
      },
    });
  }

  protected exportarPdf(): void {
    this.exportando.set(true);
    this.ventasService.exportarEstadoCuentaPdf(this.clientePublicId).subscribe({
      next: (blob) => {
        this.exportando.set(false);
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `estado-cuenta-${this.clientePublicId}.pdf`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportando.set(false);
        this.toastService.error('No se pudo exportar el estado de cuenta');
      },
    });
  }
}
