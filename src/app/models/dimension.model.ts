export interface Dimension {
  publicId: string;
  nombre: string;
  alto: number;
  ancho: number;
  profundidad: number;
  usoComun: string | null;
  fotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearDimensionPayload {
  nombre: string;
  alto: number;
  ancho: number;
  profundidad: number;
  usoComun?: string;
  fotoUrl: string;
  fotoPublicId?: string;
}

export type ActualizarDimensionPayload = Partial<CrearDimensionPayload>;
