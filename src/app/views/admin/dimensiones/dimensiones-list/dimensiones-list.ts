import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DimensionFormComponent } from '../../../../components/compuestos/dimension-form/dimension-form';
import { ColumnaTabla, DataTableComponent } from '../../../../components/compuestos/data-table/data-table';
import { ConfirmationModalComponent } from '../../../../components/modales/confirmation-modal/confirmation-modal';
import { ButtonComponent } from '../../../../components/principales/button/button';
import { ModalComponent } from '../../../../components/principales/modal/modal';
import { SpinnerComponent } from '../../../../components/principales/spinner/spinner';
import { ToastService } from '../../../../components/principales/toast/toast.service';
import { SearchBarComponent } from '../../../../components/secundarios/search-bar/search-bar';
import { PhosphorIconComponent } from '../../../../components/svgs/phosphor-icon';
import { ApiErrorResponse, Dimension } from '../../../../models/index.models';
import { DimensionesService } from '../../../../services/index.services';

type ModoModal = 'ver' | 'editar' | 'crear';

@Component({
  selector: 'app-dimensiones-list',
  standalone: true,
  imports: [
    FormsModule,
    DataTableComponent,
    ConfirmationModalComponent,
    ModalComponent,
    DimensionFormComponent,
    ButtonComponent,
    SearchBarComponent,
    SpinnerComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './dimensiones-list.html',
  styleUrl: './dimensiones-list.css',
})
export class DimensionesListComponent implements OnInit {
  private readonly dimensionesService = inject(DimensionesService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly dimensiones = signal<Dimension[]>([]);
  protected readonly busqueda = signal('');
  protected readonly dimensionAEliminar = signal<Dimension | null>(null);
  protected readonly eliminando = signal(false);

  protected readonly modalAbierto = signal(false);
  protected readonly modoModal = signal<ModoModal>('ver');
  protected readonly dimensionModal = signal<Dimension | null>(null);
  protected readonly cargandoModal = signal(false);

  protected readonly columnas: ColumnaTabla<Dimension>[] = [
    { header: 'Nombre', accessor: (d) => d.nombre },
    {
      header: 'Medidas (cm)',
      accessor: (d) => `${d.alto} x ${d.ancho} x ${d.profundidad}`,
    },
    { header: 'Uso comun', accessor: (d) => d.usoComun ?? '-' },
  ];

  protected readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.dimensiones();

    return this.dimensiones().filter((d) => {
      return (
        d.nombre.toLowerCase().includes(texto) || (d.usoComun ?? '').toLowerCase().includes(texto)
      );
    });
  });

  protected readonly tituloModal = computed(() => {
    if (this.modoModal() === 'crear') return 'Nueva dimension';
    if (this.modoModal() === 'editar') return 'Editar dimension';
    return this.dimensionModal()?.nombre ?? 'Dimension';
  });

  ngOnInit(): void {
    this.cargar();

    this.route.paramMap.subscribe((params) => {
      const publicId = params.get('publicId');
      const esCrear = this.route.snapshot.data['modo'] === 'crear';

      if (esCrear) {
        this.modalAbierto.set(true);
        this.modoModal.set('crear');
        this.dimensionModal.set(null);
        return;
      }

      if (publicId) {
        const estado = history.state as { modo?: 'ver' | 'editar' } | null;
        const modo = estado?.modo === 'editar' ? 'editar' : 'ver';
        this.abrirModalParaId(publicId, modo);
        return;
      }

      this.modalAbierto.set(false);
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.dimensionesService.listar().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.dimensiones.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private abrirModalParaId(publicId: string, modo: 'ver' | 'editar'): void {
    this.modalAbierto.set(true);
    this.modoModal.set(modo);
    this.cargandoModal.set(true);
    this.dimensionModal.set(null);

    this.dimensionesService.obtener(publicId).subscribe({
      next: (respuesta) => {
        this.cargandoModal.set(false);
        if (respuesta.success) {
          this.dimensionModal.set(respuesta.data);
        } else {
          this.toastService.error(respuesta.message);
          this.cerrarModal();
        }
      },
      error: () => {
        this.cargandoModal.set(false);
        this.toastService.error('No se pudo cargar la dimension');
        this.cerrarModal();
      },
    });
  }

  protected abrirCrear(): void {
    this.router.navigate(['/dimensiones', 'nuevo']);
  }

  protected abrirVer(dimension: Dimension): void {
    this.router.navigate(['/dimensiones', dimension.publicId], { state: { modo: 'ver' } });
  }

  protected abrirEditar(dimension: Dimension): void {
    this.router.navigate(['/dimensiones', dimension.publicId], { state: { modo: 'editar' } });
  }

  protected pasarAEditar(): void {
    this.modoModal.set('editar');
  }

  protected cerrarModal(): void {
    this.router.navigate(['/dimensiones']);
  }

  protected alCancelarFormulario(): void {
    if (this.modoModal() === 'editar' && this.dimensionModal()) {
      this.modoModal.set('ver');
      return;
    }
    this.cerrarModal();
  }

  protected alGuardarFormulario(dimension: Dimension): void {
    this.dimensiones.update((actuales) => {
      const existe = actuales.some((d) => d.publicId === dimension.publicId);
      return existe
        ? actuales.map((d) => (d.publicId === dimension.publicId ? dimension : d))
        : [dimension, ...actuales];
    });
    this.cerrarModal();
  }

  protected eliminar(dimension: Dimension): void {
    this.dimensionAEliminar.set(dimension);
  }

  protected get mensajeEliminacion(): string {
    const nombre = this.dimensionAEliminar()?.nombre ?? '';
    return `Se eliminara definitivamente la dimension "${nombre}". Esta accion no se puede deshacer.`;
  }

  protected confirmarEliminacion(): void {
    const dimension = this.dimensionAEliminar();
    if (!dimension) return;

    this.eliminando.set(true);
    this.dimensionesService.eliminar(dimension.publicId).subscribe({
      next: (respuesta) => {
        this.eliminando.set(false);
        this.dimensionAEliminar.set(null);
        if (respuesta.success) {
          this.dimensiones.update((actuales) =>
            actuales.filter((d) => d.publicId !== dimension.publicId),
          );
          if (this.dimensionModal()?.publicId === dimension.publicId) {
            this.cerrarModal();
          }
          this.toastService.exito('Dimension eliminada correctamente');
        } else {
          this.toastService.error(respuesta.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.dimensionAEliminar.set(null);
        const cuerpo = error.error as ApiErrorResponse | undefined;
        this.toastService.error(cuerpo?.message ?? 'No se pudo eliminar la dimension');
      },
    });
  }
}
