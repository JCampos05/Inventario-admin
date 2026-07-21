import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductoFormComponent } from '../../../../components/compuestos/producto-form/producto-form';
import { ColumnaTabla, DataTableComponent } from '../../../../components/compuestos/data-table/data-table';
import { ConfirmationModalComponent } from '../../../../components/modales/confirmation-modal/confirmation-modal';
import { ButtonComponent } from '../../../../components/principales/button/button';
import { ModalComponent } from '../../../../components/principales/modal/modal';
import { OpcionSelect, SelectComponent } from '../../../../components/principales/select/select';
import { SpinnerComponent } from '../../../../components/principales/spinner/spinner';
import { ToastService } from '../../../../components/principales/toast/toast.service';
import { SearchBarComponent } from '../../../../components/secundarios/search-bar/search-bar';
import { StatusTagComponent } from '../../../../components/secundarios/status-tag/status-tag';
import { PhosphorIconComponent } from '../../../../components/svgs/phosphor-icon';
import { CATEGORIAS, Categoria, Producto, STATUS_PRODUCTO, StatusProducto } from '../../../../models/index.models';
import { ProductosService } from '../../../../services/index.services';

type ModoModal = 'ver' | 'editar' | 'crear';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    FormsModule,
    DataTableComponent,
    ConfirmationModalComponent,
    ModalComponent,
    ProductoFormComponent,
    ButtonComponent,
    SelectComponent,
    SearchBarComponent,
    SpinnerComponent,
    StatusTagComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './productos-list.html',
  styleUrl: './productos-list.css',
})
export class ProductosListComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly busqueda = signal('');
  protected readonly categoriaFiltro = signal<Categoria | ''>('');
  protected readonly statusFiltro = signal<StatusProducto | ''>('');
  protected readonly productoAEliminar = signal<Producto | null>(null);
  protected readonly cambiandoStatus = signal(false);

  protected readonly modalAbierto = signal(false);
  protected readonly modoModal = signal<ModoModal>('ver');
  protected readonly productoModal = signal<Producto | null>(null);
  protected readonly cargandoModal = signal(false);

  protected readonly opcionesCategoria: OpcionSelect[] = CATEGORIAS.map((c) => ({
    value: c.value,
    label: c.label,
  }));
  protected readonly opcionesStatus: OpcionSelect[] = STATUS_PRODUCTO.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  protected readonly columnas: ColumnaTabla<Producto>[] = [
    { header: 'Producto', accessor: (p) => p.nombre },
    { header: 'Precio', accessor: (p) => `$${Number(p.precio).toFixed(2)}`, align: 'right' },
    { header: 'Descuento', accessor: (p) => `$${Number(p.descuento).toFixed(2)}`, align: 'right' },
  ];

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const categoria = this.categoriaFiltro();
    const status = this.statusFiltro();

    return this.productos().filter((p) => {
      const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto);
      const coincideCategoria = !categoria || p.categoria === categoria;
      const coincideStatus = !status || p.status === status;
      return coincideTexto && coincideCategoria && coincideStatus;
    });
  });

  protected readonly tituloModal = computed(() => {
    if (this.modoModal() === 'crear') return 'Nuevo producto';
    if (this.modoModal() === 'editar') return 'Editar producto';
    return this.productoModal()?.nombre ?? 'Producto';
  });

  ngOnInit(): void {
    this.cargar();

    this.route.paramMap.subscribe((params) => {
      const publicId = params.get('publicId');
      const esCrear = this.route.snapshot.data['modo'] === 'crear';

      if (esCrear) {
        this.modalAbierto.set(true);
        this.modoModal.set('crear');
        this.productoModal.set(null);
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
    this.productosService.listar().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.productos.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private abrirModalParaId(publicId: string, modo: 'ver' | 'editar'): void {
    this.modalAbierto.set(true);
    this.modoModal.set(modo);
    this.cargandoModal.set(true);
    this.productoModal.set(null);

    this.productosService.obtener(publicId).subscribe({
      next: (respuesta) => {
        this.cargandoModal.set(false);
        if (respuesta.success) {
          this.productoModal.set(respuesta.data);
        } else {
          this.toastService.error(respuesta.message);
          this.cerrarModal();
        }
      },
      error: () => {
        this.cargandoModal.set(false);
        this.toastService.error('No se pudo cargar el producto');
        this.cerrarModal();
      },
    });
  }

  protected etiquetaCategoria(categoria: Categoria): string {
    return CATEGORIAS.find((c) => c.value === categoria)?.label ?? categoria;
  }

  protected numero(valor: number | string): number {
    return Number(valor);
  }

  protected abrirCrear(): void {
    this.router.navigate(['/productos', 'nuevo']);
  }

  protected abrirVer(producto: Producto): void {
    this.router.navigate(['/productos', producto.publicId], { state: { modo: 'ver' } });
  }

  protected abrirEditar(producto: Producto): void {
    this.router.navigate(['/productos', producto.publicId], { state: { modo: 'editar' } });
  }

  protected pasarAEditar(): void {
    this.modoModal.set('editar');
  }

  protected cerrarModal(): void {
    this.router.navigate(['/productos']);
  }

  protected alCancelarFormulario(): void {
    if (this.modoModal() === 'editar' && this.productoModal()) {
      this.modoModal.set('ver');
      return;
    }
    this.cerrarModal();
  }

  protected alGuardarFormulario(producto: Producto): void {
    this.productos.update((actuales) => {
      const existe = actuales.some((p) => p.publicId === producto.publicId);
      return existe
        ? actuales.map((p) => (p.publicId === producto.publicId ? producto : p))
        : [producto, ...actuales];
    });
    this.cerrarModal();
  }

  protected eliminar(producto: Producto): void {
    this.productoAEliminar.set(producto);
  }

  protected alCambiarStatus(producto: Producto, nuevoStatus: StatusProducto): void {
    if (nuevoStatus === producto.status) return;
    if (nuevoStatus === 'ELIMINADO') {
      this.productoAEliminar.set(producto);
      return;
    }
    this.aplicarCambioStatus(producto, nuevoStatus);
  }

  protected get mensajeEliminacion(): string {
    const nombre = this.productoAEliminar()?.nombre ?? '';
    return `Se marcara "${nombre}" como eliminado. El job de limpieza lo purgara definitivamente tras el periodo de retencion configurado.`;
  }

  protected confirmarEliminacion(): void {
    const producto = this.productoAEliminar();
    if (!producto) return;
    this.aplicarCambioStatus(producto, 'ELIMINADO');
  }

  private aplicarCambioStatus(producto: Producto, nuevoStatus: StatusProducto): void {
    this.cambiandoStatus.set(true);
    this.productosService.cambiarStatus(producto.publicId, nuevoStatus).subscribe({
      next: (respuesta) => {
        this.cambiandoStatus.set(false);
        this.productoAEliminar.set(null);
        if (respuesta.success) {
          this.productos.update((actuales) =>
            actuales.map((p) => (p.publicId === producto.publicId ? respuesta.data : p)),
          );
          if (this.productoModal()?.publicId === producto.publicId) {
            this.productoModal.set(respuesta.data);
          }
          this.toastService.exito('Status actualizado correctamente');
        } else {
          this.toastService.error(respuesta.message);
        }
      },
      error: () => {
        this.cambiandoStatus.set(false);
        this.productoAEliminar.set(null);
        this.toastService.error('No se pudo actualizar el status');
      },
    });
  }
}
