import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ActualizarConfiguracionPayload,
  ApiResponse,
  Configuracion,
  JobLog,
} from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/configuracion`;

  obtener(): Observable<ApiResponse<Configuracion>> {
    return this.http.get<ApiResponse<Configuracion>>(this.base);
  }

  actualizar(payload: ActualizarConfiguracionPayload): Observable<ApiResponse<Configuracion>> {
    return this.http.put<ApiResponse<Configuracion>>(this.base, payload);
  }

  logs(): Observable<ApiResponse<JobLog[]>> {
    return this.http.get<ApiResponse<JobLog[]>>(`${this.base}/logs`);
  }
}
