import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProveedorFormComponent } from '../../../../components/compuestos/proveedor-form/proveedor-form';
import { ColumnaTabla, DataTableComponent } from '../../../../components/compuestos/data-table/data-table';
import { ConfirmationModalComponent } from '../../../../components/modales/confirmation-modal/confirmation-modal';
import { ButtonComponent } from '../../../../components/principales/button/button';
import { ModalComponent } from '../../../../components/principales/modal/modal';
import { SpinnerComponent } from '../../../../components/principales/spinner/spinner';
import { ToastService } from '../../../../components/principales/toast/toast.service';
import { SearchBarComponent } from '../../../../components/secundarios/search-bar/search-bar';
import { PhosphorIconComponent } from '../../../../components/svgs/phosphor-icon';
import { ApiErrorResponse, Proveedor } from '../../../../models/index.models';
import { ProveedoresService } from '../../../../services/index.services';
import { buildWhatsappLink, mensajeContactoProveedor } from '../../../../utils/whatsapp.util';

type ModoModal = 'ver' | 'editar' | 'crear';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [
    FormsModule,
    DataTableComponent,
    ConfirmationModalComponent,
    ModalComponent,
    ProveedorFormComponent,
    ButtonComponent,
    SearchBarComponent,
    SpinnerComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './proveedores-list.html',
  styleUrl: './proveedores-list.css',
})
export class ProveedoresListComponent implements OnInit {
  private readonly proveedoresService = inject(ProveedoresService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly proveedores = signal<Proveedor[]>([]);
  protected readonly busqueda = signal('');
  protected readonly proveedorAEliminar = signal<Proveedor | null>(null);
  protected readonly eliminando = signal(false);

  protected readonly modalAbierto = signal(false);
  protected readonly modoModal = signal<ModoModal>('ver');
  protected readonly proveedorModal = signal<Proveedor | null>(null);
  protected readonly cargandoModal = signal(false);

  protected readonly columnas: ColumnaTabla<Proveedor>[] = [
    { header: 'Tienda', accessor: (p) => p.nombreTienda },
    { header: 'Telefono', accessor: (p) => p.telefono ?? '-' },
    { header: 'Link', accessor: (p) => p.linkWeb ?? '-' },
  ];

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.proveedores();

    return this.proveedores().filter((p) => {
      return (
        p.nombreTienda.toLowerCase().includes(texto) ||
        (p.telefono ?? '').toLowerCase().includes(texto)
      );
    });
  });

  protected readonly tituloModal = computed(() => {
    if (this.modoModal() === 'crear') return 'Nuevo proveedor';
    if (this.modoModal() === 'editar') return 'Editar proveedor';
    return this.proveedorModal()?.nombreTienda ?? 'Proveedor';
  });

  ngOnInit(): void {
    this.cargar();

    this.route.paramMap.subscribe((params) => {
      const publicId = params.get('publicId');
      const esCrear = this.route.snapshot.data['modo'] === 'crear';

      if (esCrear) {
        this.modalAbierto.set(true);
        this.modoModal.set('crear');
        this.proveedorModal.set(null);
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
    this.proveedoresService.listar().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.proveedores.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private abrirModalParaId(publicId: string, modo: 'ver' | 'editar'): void {
    this.modalAbierto.set(true);
    this.modoModal.set(modo);
    this.cargandoModal.set(true);
    this.proveedorModal.set(null);

    this.proveedoresService.obtener(publicId).subscribe({
      next: (respuesta) => {
        this.cargandoModal.set(false);
        if (respuesta.success) {
          this.proveedorModal.set(respuesta.data);
        } else {
          this.toastService.error(respuesta.message);
          this.cerrarModal();
        }
      },
      error: () => {
        this.cargandoModal.set(false);
        this.toastService.error('No se pudo cargar el proveedor');
        this.cerrarModal();
      },
    });
  }

  protected linkWhatsapp(proveedor: Proveedor): string | null {
    if (!proveedor.telefono) return null;
    return buildWhatsappLink(proveedor.telefono, mensajeContactoProveedor(proveedor.nombreTienda));
  }

  protected abrirCrear(): void {
    this.router.navigate(['/proveedores', 'nuevo']);
  }

  protected abrirVer(proveedor: Proveedor): void {
    this.router.navigate(['/proveedores', proveedor.publicId], { state: { modo: 'ver' } });
  }

  protected abrirEditar(proveedor: Proveedor): void {
    this.router.navigate(['/proveedores', proveedor.publicId], { state: { modo: 'editar' } });
  }

  protected pasarAEditar(): void {
    this.modoModal.set('editar');
  }

  protected cerrarModal(): void {
    this.router.navigate(['/proveedores']);
  }

  protected alCancelarFormulario(): void {
    if (this.modoModal() === 'editar' && this.proveedorModal()) {
      this.modoModal.set('ver');
      return;
    }
    this.cerrarModal();
  }

  protected alGuardarFormulario(proveedor: Proveedor): void {
    this.proveedores.update((actuales) => {
      const existe = actuales.some((p) => p.publicId === proveedor.publicId);
      return existe
        ? actuales.map((p) => (p.publicId === proveedor.publicId ? proveedor : p))
        : [proveedor, ...actuales];
    });
    this.cerrarModal();
  }

  protected eliminar(proveedor: Proveedor): void {
    this.proveedorAEliminar.set(proveedor);
  }

  protected get mensajeEliminacion(): string {
    const nombre = this.proveedorAEliminar()?.nombreTienda ?? '';
    return `Se eliminara definitivamente al proveedor "${nombre}". Esta accion no se puede deshacer.`;
  }

  protected confirmarEliminacion(): void {
    const proveedor = this.proveedorAEliminar();
    if (!proveedor) return;

    this.eliminando.set(true);
    this.proveedoresService.eliminar(proveedor.publicId).subscribe({
      next: (respuesta) => {
        this.eliminando.set(false);
        this.proveedorAEliminar.set(null);
        if (respuesta.success) {
          this.proveedores.update((actuales) =>
            actuales.filter((p) => p.publicId !== proveedor.publicId),
          );
          if (this.proveedorModal()?.publicId === proveedor.publicId) {
            this.cerrarModal();
          }
          this.toastService.exito('Proveedor eliminado correctamente');
        } else {
          this.toastService.error(respuesta.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.proveedorAEliminar.set(null);
        const cuerpo = error.error as ApiErrorResponse | undefined;
        this.toastService.error(cuerpo?.message ?? 'No se pudo eliminar el proveedor');
      },
    });
  }
}
