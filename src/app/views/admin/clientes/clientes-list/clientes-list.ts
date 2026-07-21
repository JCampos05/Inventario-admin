import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ClienteFormComponent } from '../../../../components/compuestos/cliente-form/cliente-form';
import { CuentaClienteComponent } from '../../../../components/compuestos/cuenta-cliente/cuenta-cliente';
import { ColumnaTabla, DataTableComponent } from '../../../../components/compuestos/data-table/data-table';
import { ConfirmationModalComponent } from '../../../../components/modales/confirmation-modal/confirmation-modal';
import { ButtonComponent } from '../../../../components/principales/button/button';
import { ModalComponent } from '../../../../components/principales/modal/modal';
import { SpinnerComponent } from '../../../../components/principales/spinner/spinner';
import { ToastService } from '../../../../components/principales/toast/toast.service';
import { SearchBarComponent } from '../../../../components/secundarios/search-bar/search-bar';
import { PhosphorIconComponent } from '../../../../components/svgs/phosphor-icon';
import { ApiErrorResponse, Cliente } from '../../../../models/index.models';
import { ClientesService } from '../../../../services/index.services';

type ModoModal = 'ver' | 'editar' | 'crear' | 'cuenta';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    FormsModule,
    DataTableComponent,
    ConfirmationModalComponent,
    ModalComponent,
    ClienteFormComponent,
    CuentaClienteComponent,
    ButtonComponent,
    SearchBarComponent,
    SpinnerComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.css',
})
export class ClientesListComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly busqueda = signal('');
  protected readonly clienteAEliminar = signal<Cliente | null>(null);
  protected readonly eliminando = signal(false);

  protected readonly modalAbierto = signal(false);
  protected readonly modoModal = signal<ModoModal>('ver');
  protected readonly clienteModal = signal<Cliente | null>(null);
  protected readonly cargandoModal = signal(false);

  protected readonly columnas: ColumnaTabla<Cliente>[] = [
    { header: 'Nombre', accessor: (c) => c.nombre },
    { header: 'Telefono', accessor: (c) => c.telefono ?? '-' },
    { header: 'Email', accessor: (c) => c.email ?? '-' },
  ];

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.clientes();

    return this.clientes().filter((c) => {
      return (
        c.nombre.toLowerCase().includes(texto) ||
        (c.telefono ?? '').toLowerCase().includes(texto) ||
        (c.email ?? '').toLowerCase().includes(texto)
      );
    });
  });

  protected readonly tituloModal = computed(() => {
    if (this.modoModal() === 'crear') return 'Nuevo cliente';
    if (this.modoModal() === 'editar') return 'Editar cliente';
    if (this.modoModal() === 'cuenta') return `Cuenta de ${this.clienteModal()?.nombre ?? ''}`;
    return this.clienteModal()?.nombre ?? 'Cliente';
  });

  ngOnInit(): void {
    this.cargar();

    this.route.paramMap.subscribe((params) => {
      const publicId = params.get('publicId');
      const esCrear = this.route.snapshot.data['modo'] === 'crear';

      if (esCrear) {
        this.modalAbierto.set(true);
        this.modoModal.set('crear');
        this.clienteModal.set(null);
        return;
      }

      if (publicId) {
        const estado = history.state as { modo?: 'ver' | 'editar' | 'cuenta' } | null;
        const modo =
          estado?.modo === 'editar' || estado?.modo === 'cuenta' ? estado.modo : 'ver';
        this.abrirModalParaId(publicId, modo);
        return;
      }

      this.modalAbierto.set(false);
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.clientesService.listar().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.clientes.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private abrirModalParaId(publicId: string, modo: 'ver' | 'editar' | 'cuenta'): void {
    this.modalAbierto.set(true);
    this.modoModal.set(modo);
    this.cargandoModal.set(true);
    this.clienteModal.set(null);

    this.clientesService.obtener(publicId).subscribe({
      next: (respuesta) => {
        this.cargandoModal.set(false);
        if (respuesta.success) {
          this.clienteModal.set(respuesta.data);
        } else {
          this.toastService.error(respuesta.message);
          this.cerrarModal();
        }
      },
      error: () => {
        this.cargandoModal.set(false);
        this.toastService.error('No se pudo cargar el cliente');
        this.cerrarModal();
      },
    });
  }

  protected abrirCrear(): void {
    this.router.navigate(['/clientes', 'nuevo']);
  }

  protected abrirVer(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.publicId], { state: { modo: 'ver' } });
  }

  protected abrirEditar(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.publicId], { state: { modo: 'editar' } });
  }

  protected abrirCuenta(cliente: Cliente): void {
    if (this.modalAbierto() && this.clienteModal()?.publicId === cliente.publicId) {
      this.pasarACuenta();
      return;
    }
    this.router.navigate(['/clientes', cliente.publicId], { state: { modo: 'cuenta' } });
  }

  protected pasarAEditar(): void {
    this.modoModal.set('editar');
  }

  protected pasarACuenta(): void {
    this.modoModal.set('cuenta');
  }

  protected cerrarModal(): void {
    this.router.navigate(['/clientes']);
  }

  protected alCancelarFormulario(): void {
    if (this.modoModal() === 'editar' && this.clienteModal()) {
      this.modoModal.set('ver');
      return;
    }
    this.cerrarModal();
  }

  protected alGuardarFormulario(cliente: Cliente): void {
    this.clientes.update((actuales) => {
      const existe = actuales.some((c) => c.publicId === cliente.publicId);
      return existe
        ? actuales.map((c) => (c.publicId === cliente.publicId ? cliente : c))
        : [cliente, ...actuales];
    });
    this.cerrarModal();
  }

  protected eliminar(cliente: Cliente): void {
    this.clienteAEliminar.set(cliente);
  }

  protected get mensajeEliminacion(): string {
    const nombre = this.clienteAEliminar()?.nombre ?? '';
    return `Se eliminara definitivamente al cliente "${nombre}". Esta accion no se puede deshacer.`;
  }

  protected confirmarEliminacion(): void {
    const cliente = this.clienteAEliminar();
    if (!cliente) return;

    this.eliminando.set(true);
    this.clientesService.eliminar(cliente.publicId).subscribe({
      next: (respuesta) => {
        this.eliminando.set(false);
        this.clienteAEliminar.set(null);
        if (respuesta.success) {
          this.clientes.update((actuales) => actuales.filter((c) => c.publicId !== cliente.publicId));
          if (this.clienteModal()?.publicId === cliente.publicId) {
            this.cerrarModal();
          }
          this.toastService.exito('Cliente eliminado correctamente');
        } else {
          this.toastService.error(respuesta.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.clienteAEliminar.set(null);
        const cuerpo = error.error as ApiErrorResponse | undefined;
        this.toastService.error(cuerpo?.message ?? 'No se pudo eliminar el cliente');
      },
    });
  }
}
