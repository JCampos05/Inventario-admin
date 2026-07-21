import { Cliente } from './cliente.model';

export interface Venta {
  publicId: string;
  fecha: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
  cliente: Cliente;
  createdAt: string;
  updatedAt: string;
}

export interface CrearVentaPayload {
  clientePublicId: string;
  concepto: string;
  debe?: number;
  haber?: number;
  fecha?: string;
}

export interface ActualizarVentaPayload {
  concepto: string;
}

export interface ResumenCuentaCliente {
  cliente: Cliente;
  saldoActual: number;
  ultimoMovimiento: string | null;
  totalMovimientos: number;
}
