export interface Cliente {
  publicId: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearClientePayload {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export type ActualizarClientePayload = Partial<CrearClientePayload>;
