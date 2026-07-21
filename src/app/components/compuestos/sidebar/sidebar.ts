import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

const ITEMS_MENU: ItemMenu[] = [
  { ruta: '/dashboard', etiqueta: 'Dashboard', icono: 'squares-four' },
  { ruta: '/productos', etiqueta: 'Productos', icono: 'handbag' },
  { ruta: '/dimensiones', etiqueta: 'Dimensiones', icono: 'ruler' },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: 'users' },
  { ruta: '/proveedores', etiqueta: 'Proveedores', icono: 'truck' },
  { ruta: '/ventas', etiqueta: 'Ventas', icono: 'receipt' },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'user-circle' },
  { ruta: '/configuracion', etiqueta: 'Configuracion', icono: 'gear' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PhosphorIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @Input() open = false;
  @Input() nombreUsuario = '';
  @Output() closed = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  protected readonly items = ITEMS_MENU;

  protected get iniciales(): string {
    return this.nombreUsuario
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  }
}
