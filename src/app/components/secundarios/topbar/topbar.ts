import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CATEGORIAS, Categoria, Producto } from '../../../models/index.models';
import { ProductosService } from '../../../services/index.services';
import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly router = inject(Router);

  @Output() toggleSidebar = new EventEmitter<void>();

  protected readonly consulta = signal('');
  protected readonly resultados = signal<Producto[]>([]);
  protected readonly mostrarResultados = signal(false);

  private todosLosProductos: Producto[] = [];
  private temporizador?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.productosService.listar().subscribe({
      next: (respuesta) => {
        if (respuesta.success) {
          this.todosLosProductos = respuesta.data;
        }
      },
    });
  }

  protected etiquetaCategoria(categoria: Categoria): string {
    return CATEGORIAS.find((c) => c.value === categoria)?.label ?? categoria;
  }

  protected alEscribir(valor: string): void {
    this.consulta.set(valor);
    clearTimeout(this.temporizador);

    const texto = valor.trim().toLowerCase();
    if (!texto) {
      this.resultados.set([]);
      this.mostrarResultados.set(false);
      return;
    }

    this.temporizador = setTimeout(() => {
      this.resultados.set(
        this.todosLosProductos.filter((p) => p.nombre.toLowerCase().includes(texto)).slice(0, 6),
      );
      this.mostrarResultados.set(true);
    }, 150);
  }

  protected alEnfocar(): void {
    if (this.consulta().trim() && this.resultados().length >= 0) {
      this.mostrarResultados.set(true);
    }
  }

  protected cerrarConRetraso(): void {
    setTimeout(() => this.mostrarResultados.set(false), 150);
  }

  protected seleccionar(producto: Producto): void {
    this.consulta.set('');
    this.resultados.set([]);
    this.mostrarResultados.set(false);
    this.router.navigate(['/productos', producto.publicId], { state: { modo: 'ver' } });
  }
}
