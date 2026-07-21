import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarProveedorPayload,
  ApiResponse,
  CrearProveedorPayload,
  Proveedor,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proveedores`;

  listar(): Observable<ApiResponse<Proveedor[]>> {
    return this.http.get<ApiResponse<Proveedor[]>>(this.base);
  }

  obtener(publicId: string): Observable<ApiResponse<Proveedor>> {
    return this.http.get<ApiResponse<Proveedor>>(`${this.base}/${publicId}`);
  }

  crear(payload: CrearProveedorPayload): Observable<ApiResponse<Proveedor>> {
    return this.http.post<ApiResponse<Proveedor>>(this.base, payload);
  }

  actualizar(
    publicId: string,
    payload: ActualizarProveedorPayload,
  ): Observable<ApiResponse<Proveedor>> {
    return this.http.put<ApiResponse<Proveedor>>(`${this.base}/${publicId}`, payload);
  }

  eliminar(publicId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${publicId}`);
  }
}
