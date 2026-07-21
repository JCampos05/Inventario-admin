import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../principales/button/button';
import { InputComponent } from '../../principales/input/input';
import { OpcionSelect, SelectComponent } from '../../principales/select/select';
import { SpinnerComponent } from '../../principales/spinner/spinner';
import { TextareaComponent } from '../../principales/textarea/textarea';
import { ToastService } from '../../principales/toast/toast.service';
import { PhosphorIconComponent } from '../../svgs/phosphor-icon';
import {
  ApiErrorResponse,
  ApiFieldError,
  CATEGORIAS,
  Categoria,
  CrearProductoPayload,
  Dimension,
  Producto,
} from '../../../models/index.models';
import { DimensionesService, FotosService, ProductosService } from '../../../services/index.services';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    SpinnerComponent,
    TextareaComponent,
    ButtonComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoFormComponent implements OnInit, OnChanges {
  @Input() producto: Producto | null = null;
  @Output() guardado = new EventEmitter<Producto>();
  @Output() cancelado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly dimensionesService = inject(DimensionesService);
  private readonly fotosService = inject(FotosService);
  private readonly productosService = inject(ProductosService);
  private readonly toastService = inject(ToastService);

  protected readonly categorias: OpcionSelect[] = CATEGORIAS.map((c) => ({
    value: c.value,
    label: c.label,
  }));
  protected readonly dimensiones = signal<Dimension[]>([]);
  protected readonly opcionesDimension = signal<OpcionSelect[]>([]);
  protected readonly subiendoFoto = signal(false);
  protected readonly guardando = signal(false);
  protected readonly fotoUrl = signal<string>('');
  protected readonly fotoPublicId = signal<string | undefined>(undefined);
  protected readonly errorFoto = signal<string | null>(null);
  protected readonly errores = signal<Record<string, string>>({});

  protected readonly formulario = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoria: ['' as Categoria | '', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    descuento: [0, [Validators.min(0)]],
    dimensionPublicId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.dimensionesService.listar().subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.dimensiones.set(respuesta.data);
          this.opcionesDimension.set(
            respuesta.data.map((d) => ({ value: d.publicId, label: d.nombre })),
          );
        }
      },
    });
    this.cargarProducto();
  }

  ngOnChanges(): void {
    this.cargarProducto();
  }

  private cargarProducto(): void {
    if (!this.producto) return;
    this.formulario.patchValue({
      nombre: this.producto.nombre,
      descripcion: this.producto.descripcion,
      categoria: this.producto.categoria,
      precio: this.producto.precio,
      descuento: this.producto.descuento,
      dimensionPublicId: this.producto.dimension.publicId,
    });
    this.fotoUrl.set(this.producto.fotoUrl);
  }

  protected alSeleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.errorFoto.set(null);
    this.subiendoFoto.set(true);
    this.fotosService.subir(archivo).subscribe({
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
    const payload: CrearProductoPayload = {
      nombre: valores.nombre!,
      descripcion: valores.descripcion!,
      categoria: valores.categoria as Categoria,
      precio: Number(valores.precio),
      descuento: Number(valores.descuento ?? 0),
      dimensionPublicId: valores.dimensionPublicId!,
      fotoUrl: this.fotoUrl(),
      ...(this.fotoPublicId() ? { fotoPublicId: this.fotoPublicId() } : {}),
    };

    this.guardando.set(true);
    const peticion = this.producto
      ? this.productosService.actualizar(this.producto.publicId, payload)
      : this.productosService.crear(payload);

    peticion.subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        if (respuesta.success) {
          this.toastService.exito(respuesta.message ?? 'Producto guardado correctamente');
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
