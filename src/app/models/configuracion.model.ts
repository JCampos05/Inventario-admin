export interface Configuracion {
  publicId: string;
  nombreNegocio: string;
  whatsappAdmin: string;
  driveCarpetaUrl: string;
  diasRetencionEliminados: number;
  moneda: string;
  logoUrl: string | null;
  horarioAtencion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActualizarConfiguracionPayload {
  nombreNegocio?: string;
  whatsappAdmin?: string;
  driveCarpetaUrl?: string;
  diasRetencionEliminados?: number;
  moneda?: string;
  logoUrl?: string | null;
  horarioAtencion?: string | null;
}

export const MONEDAS: { value: string; label: string }[] = [
  { value: 'MXN', label: 'MXN - Peso mexicano' },
  { value: 'USD', label: 'USD - Dolar estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GTQ', label: 'GTQ - Quetzal guatemalteco' },
  { value: 'COP', label: 'COP - Peso colombiano' },
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'CLP', label: 'CLP - Peso chileno' },
  { value: 'PEN', label: 'PEN - Sol peruano' },
  { value: 'BRL', label: 'BRL - Real brasileno' },
];

export type EstadoJob = 'EXITOSO' | 'ERROR';

export interface JobLog {
  publicId: string;
  nombreJob: string;
  estado: EstadoJob;
  mensaje: string;
  ejecutadoEn: string;
}
