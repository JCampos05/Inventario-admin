import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CuentaClienteComponent } from '../../../../components/compuestos/cuenta-cliente/cuenta-cliente';
import { ColumnaTabla, DataTableComponent } from '../../../../components/compuestos/data-table/data-table';
import { ModalComponent } from '../../../../components/principales/modal/modal';
import { ToastService } from '../../../../components/principales/toast/toast.service';
import { SearchBarComponent } from '../../../../components/secundarios/search-bar/search-bar';
import { PhosphorIconComponent } from '../../../../components/svgs/phosphor-icon';
import { ResumenCuentaCliente } from '../../../../models/index.models';
import { VentasService } from '../../../../services/index.services';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [
    FormsModule,
    DataTableComponent,
    ModalComponent,
    CuentaClienteComponent,
    SearchBarComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './ventas-list.html',
  styleUrl: './ventas-list.css',
})
export class VentasListComponent implements OnInit {
  private readonly ventasService = inject(VentasService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly resumenes = signal<ResumenCuentaCliente[]>([]);
  protected readonly busqueda = signal('');
  protected readonly exportandoPublicId = signal<string | null>(null);

  protected readonly modalAbierto = signal(false);
  protected readonly clientePublicIdModal = signal<string | null>(null);

  protected readonly tituloModal = computed(() => {
    const publicId = this.clientePublicIdModal();
    const resumen = this.resumenes().find((r) => r.cliente.publicId === publicId);
    return resumen ? `Cuenta de ${resumen.cliente.nombre}` : 'Cuenta del cliente';
  });

  protected readonly columnas: ColumnaTabla<ResumenCuentaCliente>[] = [
    { header: 'Cliente', accessor: (r) => r.cliente.nombre },
    {
      header: 'Saldo actual',
      accessor: (r) => `$${r.saldoActual.toFixed(2)}`,
      align: 'right',
    },
    {
      header: 'Ultimo movimiento',
      accessor: (r) => (r.ultimoMovimiento ? this.formatearFecha(r.ultimoMovimiento) : 'Sin movimientos'),
    },
    { header: 'Movimientos', accessor: (r) => String(r.totalMovimientos), align: 'right' },
  ];

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.resumenes();
    return this.resumenes().filter((r) => r.cliente.nombre.toLowerCase().includes(texto));
  });

  ngOnInit(): void {
    this.cargar();

    this.route.paramMap.subscribe((params) => {
      const clientePublicId = params.get('clientePublicId');
      if (clientePublicId) {
        this.abrirCuenta(clientePublicId);
        return;
      }
      this.modalAbierto.set(false);
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.ventasService.resumen().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.resumenes.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  protected formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  protected abrirVerCuenta(resumen: ResumenCuentaCliente): void {
    this.router.navigate(['/ventas', resumen.cliente.publicId]);
  }

  private abrirCuenta(clientePublicId: string): void {
    this.clientePublicIdModal.set(clientePublicId);
    this.modalAbierto.set(true);
  }

  protected cerrarModal(): void {
    this.router.navigate(['/ventas']);
  }

  protected exportarPdf(resumen: ResumenCuentaCliente): void {
    this.exportandoPublicId.set(resumen.cliente.publicId);
    this.ventasService.exportarEstadoCuentaPdf(resumen.cliente.publicId).subscribe({
      next: (blob) => {
        this.exportandoPublicId.set(null);
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `estado-cuenta-${resumen.cliente.publicId}.pdf`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportandoPublicId.set(null);
        this.toastService.error('No se pudo exportar el estado de cuenta');
      },
    });
  }
}
