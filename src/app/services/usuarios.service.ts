import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarUsuarioPayload,
  ApiResponse,
  CrearUsuarioPayload,
  Usuario,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  listar(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(this.base);
  }

  obtener(publicId: string): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.base}/${publicId}`);
  }

  crear(payload: CrearUsuarioPayload): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.base, payload);
  }

  actualizar(publicId: string, payload: ActualizarUsuarioPayload): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.base}/${publicId}`, payload);
  }

  cambiarStatus(publicId: string, activo: boolean): Observable<ApiResponse<Usuario>> {
    return this.http.patch<ApiResponse<Usuario>>(`${this.base}/${publicId}/status`, { activo });
  }
}
