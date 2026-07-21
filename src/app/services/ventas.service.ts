import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarVentaPayload,
  ApiResponse,
  CrearVentaPayload,
  ResumenCuentaCliente,
  Venta,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ventas`;

  resumen(): Observable<ApiResponse<ResumenCuentaCliente[]>> {
    return this.http.get<ApiResponse<ResumenCuentaCliente[]>>(`${this.base}/resumen`);
  }

  listarPorCliente(clientePublicId: string): Observable<ApiResponse<Venta[]>> {
    return this.http.get<ApiResponse<Venta[]>>(this.base, {
      params: { clientePublicId },
    });
  }

  crear(payload: CrearVentaPayload): Observable<ApiResponse<Venta>> {
    return this.http.post<ApiResponse<Venta>>(this.base, payload);
  }

  actualizar(publicId: string, payload: ActualizarVentaPayload): Observable<ApiResponse<Venta>> {
    return this.http.put<ApiResponse<Venta>>(`${this.base}/${publicId}`, payload);
  }

  eliminar(publicId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${publicId}`);
  }

  exportarEstadoCuentaPdf(clientePublicId: string): Observable<Blob> {
    return this.http.get(`${this.base}/estado-cuenta/${clientePublicId}/pdf`, {
      responseType: 'blob',
    });
  }
}
