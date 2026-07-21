import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../principales/button/button';
import { InputComponent } from '../../principales/input/input';
import { SpinnerComponent } from '../../principales/spinner/spinner';
import { ToastService } from '../../principales/toast/toast.service';
import { PhosphorIconComponent } from '../../svgs/phosphor-icon';
import {
  ApiErrorResponse,
  ApiFieldError,
  CrearDimensionPayload,
  Dimension,
} from '../../../models/index.models';
import { DimensionesService, FotosService } from '../../../services/index.services';

@Component({
  selector: 'app-dimension-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, SpinnerComponent, ButtonComponent, PhosphorIconComponent],
  templateUrl: './dimension-form.html',
  styleUrl: './dimension-form.css',
})
export class DimensionFormComponent implements OnChanges {
  @Input() dimension: Dimension | null = null;
  @Output() guardado = new EventEmitter<Dimension>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly dimensionesService = inject(DimensionesService);
  private readonly fotosService = inject(FotosService);
  private readonly toastService = inject(ToastService);

  protected readonly guardando = signal(false);
  protected readonly errores = signal<Record<string, string>>({});
  protected readonly subiendoFoto = signal(false);
  protected readonly fotoUrl = signal<string>('');
  protected readonly fotoPublicId = signal<string | undefined>(undefined);
  protected readonly errorFoto = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    alto: [0, [Validators.required, Validators.min(0.01)]],
    ancho: [0, [Validators.required, Validators.min(0.01)]],
    profundidad: [0, [Validators.required, Validators.min(0.01)]],
    usoComun: [''],
  });

  ngOnChanges(): void {
    this.cargarDimension();
  }

  private cargarDimension(): void {
    if (!this.dimension) return;
    this.formulario.patchValue({
      nombre: this.dimension.nombre,
      alto: this.dimension.alto,
      ancho: this.dimension.ancho,
      profundidad: this.dimension.profundidad,
      usoComun: this.dimension.usoComun ?? '',
    });
    this.fotoUrl.set(this.dimension.fotoUrl ?? '');
  }

  protected alSeleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.errorFoto.set(null);
    this.subiendoFoto.set(true);
    this.fotosService.subirDimension(archivo).subscribe({
      next: (respuesta) => {
        this.subiendoFoto.set(false);
        if (respuesta.success) {
          this.fotoUrl.set(respuesta.data.url);
          this.fotoPublicId.set(respuesta.data.publicId);
        } else {
          this.errorFoto.set(respuesta.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.subiendoFoto.set(false);
        this.errorFoto.set(this.mensajeError(error));
      },
    });
  }

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    this.errores.set({});

    if (!this.fotoUrl()) {
      this.errorFoto.set('La foto es obligatoria');
    }

    if (this.formulario.invalid || !this.fotoUrl()) {
      return;
    }

    const valores = this.formulario.getRawValue();
    const payload: CrearDimensionPayload = {
      nombre: valores.nombre!,
      alto: Number(valores.alto),
      ancho: Number(valores.ancho),
      profundidad: Number(valores.profundidad),
      ...(valores.usoComun ? { usoComun: valores.usoComun } : {}),
      fotoUrl: this.fotoUrl(),
      ...(this.fotoPublicId() ? { fotoPublicId: this.fotoPublicId() } : {}),
    };

    this.guardando.set(true);
    const peticion = this.dimension
      ? this.dimensionesService.actualizar(this.dimension.publicId, payload)
      : this.dimensionesService.crear(payload);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        if (respuesta.success) {
          this.toastService.exito(respuesta.message ?? 'Dimension guardada correctamente');
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
