import { Routes } from '@angular/router';

import { authGuard } from './auth/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/admin/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./views/admin/layout/layout').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./views/admin/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./views/admin/productos/productos-list/productos-list').then(
            (m) => m.ProductosListComponent,
          ),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./views/admin/productos/productos-list/productos-list').then(
            (m) => m.ProductosListComponent,
          ),
        data: { modo: 'crear' },
      },
      {
        path: 'productos/:publicId',
        loadComponent: () =>
          import('./views/admin/productos/productos-list/productos-list').then(
            (m) => m.ProductosListComponent,
          ),
      },
      {
        path: 'dimensiones',
        loadComponent: () =>
          import('./views/admin/dimensiones/dimensiones-list/dimensiones-list').then(
            (m) => m.DimensionesListComponent,
          ),
      },
      {
        path: 'dimensiones/nuevo',
        loadComponent: () =>
          import('./views/admin/dimensiones/dimensiones-list/dimensiones-list').then(
            (m) => m.DimensionesListComponent,
          ),
        data: { modo: 'crear' },
      },
      {
        path: 'dimensiones/:publicId',
        loadComponent: () =>
          import('./views/admin/dimensiones/dimensiones-list/dimensiones-list').then(
            (m) => m.DimensionesListComponent,
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./views/admin/clientes/clientes-list/clientes-list').then(
            (m) => m.ClientesListComponent,
          ),
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('./views/admin/clientes/clientes-list/clientes-list').then(
            (m) => m.ClientesListComponent,
          ),
        data: { modo: 'crear' },
      },
      {
        path: 'clientes/:publicId',
        loadComponent: () =>
          import('./views/admin/clientes/clientes-list/clientes-list').then(
            (m) => m.ClientesListComponent,
          ),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./views/admin/proveedores/proveedores-list/proveedores-list').then(
            (m) => m.ProveedoresListComponent,
          ),
      },
      {
        path: 'proveedores/nuevo',
        loadComponent: () =>
          import('./views/admin/proveedores/proveedores-list/proveedores-list').then(
            (m) => m.ProveedoresListComponent,
          ),
        data: { modo: 'crear' },
      },
      {
        path: 'proveedores/:publicId',
        loadComponent: () =>
          import('./views/admin/proveedores/proveedores-list/proveedores-list').then(
            (m) => m.ProveedoresListComponent,
          ),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./views/admin/ventas/ventas-list/ventas-list').then(
            (m) => m.VentasListComponent,
          ),
      },
      {
        path: 'ventas/:clientePublicId',
        loadComponent: () =>
          import('./views/admin/ventas/ventas-list/ventas-list').then(
            (m) => m.VentasListComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./views/admin/usuarios/usuarios-list/usuarios-list').then(
            (m) => m.UsuariosListComponent,
          ),
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () =>
          import('./views/admin/usuarios/usuarios-list/usuarios-list').then(
            (m) => m.UsuariosListComponent,
          ),
        data: { modo: 'crear' },
      },
      {
        path: 'usuarios/:publicId',
        loadComponent: () =>
          import('./views/admin/usuarios/usuarios-list/usuarios-list').then(
            (m) => m.UsuariosListComponent,
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./views/admin/configuracion/configuracion').then(
            (m) => m.ConfiguracionComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
