import { Component, OnInit, inject, signal } from '@angular/core';

import { AuthService } from '../../../auth/auth.service';
import { DashboardStatCardComponent } from '../../../components/compuestos/dashboard-stat-card/dashboard-stat-card';
import { Producto } from '../../../models/index.models';
import { ProductosService } from '../../../services/index.services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardStatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly authService = inject(AuthService);

  protected readonly cargando = signal(true);
  protected readonly totalExistencia = signal(0);
  protected readonly totalApartado = signal(0);
  protected readonly totalAgotado = signal(0);
  protected readonly totalProductos = signal(0);

  protected get nombreUsuario(): string {
    return this.authService.usuario()?.nombre ?? '';
  }

  ngOnInit(): void {
    this.productosService.listar().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (!respuesta.success) return;
        this.calcularTotales(respuesta.data);
      },
      error: () => this.cargando.set(false),
    });
  }

  private calcularTotales(productos: Producto[]): void {
    const activos = productos.filter((p) => p.status !== 'ELIMINADO');
    this.totalProductos.set(activos.length);
    this.totalExistencia.set(productos.filter((p) => p.status === 'EXISTENCIA').length);
    this.totalApartado.set(productos.filter((p) => p.status === 'APARTADO').length);
    this.totalAgotado.set(productos.filter((p) => p.status === 'AGOTADO').length);
  }
}
