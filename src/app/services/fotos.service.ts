import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, FotoSubida } from '../models/index.models';
import { environment } from '../auth/environment/environment';

@Injectable({ providedIn: 'root' })
export class FotosService {
  private readonly http = inject(HttpClient);

  subir(archivo: File): Observable<ApiResponse<FotoSubida>> {
    return this.subirA('productos', archivo);
  }

  subirDimension(archivo: File): Observable<ApiResponse<FotoSubida>> {
    return this.subirA('dimensiones', archivo);
  }

  private subirA(recurso: string, archivo: File): Observable<ApiResponse<FotoSubida>> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post<ApiResponse<FotoSubida>>(
      `${environment.apiUrl}/${recurso}/foto`,
      formData,
    );
  }
}
