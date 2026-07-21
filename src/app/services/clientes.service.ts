import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarClientePayload,
  ApiResponse,
  Cliente,
  CrearClientePayload,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clientes`;

  listar(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(this.base);
  }

  obtener(publicId: string): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.base}/${publicId}`);
  }

  crear(payload: CrearClientePayload): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(this.base, payload);
  }

  actualizar(
    publicId: string,
    payload: ActualizarClientePayload,
  ): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.base}/${publicId}`, payload);
  }

  eliminar(publicId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${publicId}`);
  }
}
