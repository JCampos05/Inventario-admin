import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarDimensionPayload,
  ApiResponse,
  CrearDimensionPayload,
  Dimension,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class DimensionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dimensiones`;

  listar(): Observable<ApiResponse<Dimension[]>> {
    return this.http.get<ApiResponse<Dimension[]>>(this.base);
  }

  obtener(publicId: string): Observable<ApiResponse<Dimension>> {
    return this.http.get<ApiResponse<Dimension>>(`${this.base}/${publicId}`);
  }

  crear(payload: CrearDimensionPayload): Observable<ApiResponse<Dimension>> {
    return this.http.post<ApiResponse<Dimension>>(this.base, payload);
  }

  actualizar(
    publicId: string,
    payload: ActualizarDimensionPayload,
  ): Observable<ApiResponse<Dimension>> {
    return this.http.put<ApiResponse<Dimension>>(`${this.base}/${publicId}`, payload);
  }

  eliminar(publicId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${publicId}`);
  }
}
