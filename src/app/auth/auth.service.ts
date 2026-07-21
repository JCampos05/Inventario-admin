import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiResponse, LoginPayload, LoginResponse, Usuario } from '../models/index.models';
import { environment } from './environment/environment';

const TOKEN_KEY = 'admin_token';
const USUARIO_KEY = 'admin_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly usuario = signal<Usuario | null>(this.leerUsuarioGuardado());

  login(payload: LoginPayload): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap((respuesta) => {
          if (respuesta.success) {
            this.guardarSesion(respuesta.data.token, respuesta.data.usuario);
          }
        }),
      );
  }

  me(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${environment.apiUrl}/auth/me`).pipe(
      tap((respuesta) => {
        if (respuesta.success) {
          localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.data));
          this.usuario.set(respuesta.data);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuario.set(null);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }
}
