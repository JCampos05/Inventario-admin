import { Dimension } from './dimension.model';

export type Categoria = 'BOLSA' | 'ACCESORIO' | 'JOYERIA';

export type StatusProducto = 'EXISTENCIA' | 'APARTADO' | 'AGOTADO' | 'ELIMINADO';

export interface Producto {
  publicId: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  precio: number;
  descuento: number;
  fotoUrl: string;
  status: StatusProducto;
  dimension: Dimension;
  createdAt: string;
  updatedAt: string;
}

export interface CrearProductoPayload {
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  precio: number;
  descuento?: number;
  dimensionPublicId: string;
  fotoUrl: string;
  fotoPublicId?: string;
}

export type ActualizarProductoPayload = Partial<CrearProductoPayload>;

export interface FotoSubida {
  url: string;
  publicId: string;
}

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'BOLSA', label: 'Bolsa' },
  { value: 'ACCESORIO', label: 'Accesorio' },
  { value: 'JOYERIA', label: 'Joyeria' },
];

export const STATUS_PRODUCTO: { value: StatusProducto; label: string }[] = [
  { value: 'EXISTENCIA', label: 'Existencia' },
  { value: 'APARTADO', label: 'Apartado' },
  { value: 'AGOTADO', label: 'Agotado' },
  { value: 'ELIMINADO', label: 'Eliminado' },
];
