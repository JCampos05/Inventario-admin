export interface Proveedor {
  publicId: string;
  nombreTienda: string;
  telefono: string | null;
  linkWeb: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearProveedorPayload {
  nombreTienda: string;
  telefono?: string;
  linkWeb?: string;
}

export type ActualizarProveedorPayload = Partial<CrearProveedorPayload>;
