import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarProductoPayload,
  ApiResponse,
  CrearProductoPayload,
  Producto,
  StatusProducto,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/productos`;

  listar(): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(this.base);
  }

  obtener(publicId: string): Observable<ApiResponse<Producto>> {
    return this.http.get<ApiResponse<Producto>>(`${this.base}/${publicId}`);
  }

  crear(payload: CrearProductoPayload): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(this.base, payload);
  }

  actualizar(
    publicId: string,
    payload: ActualizarProductoPayload,
  ): Observable<ApiResponse<Producto>> {
    return this.http.put<ApiResponse<Producto>>(`${this.base}/${publicId}`, payload);
  }

  cambiarStatus(publicId: string, status: StatusProducto): Observable<ApiResponse<Producto>> {
    return this.http.patch<ApiResponse<Producto>>(`${this.base}/${publicId}/status`, { status });
  }
}
