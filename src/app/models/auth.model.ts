export type RolUsuario = 'ADMIN';

export interface Usuario {
  publicId: string;
  nombre: string;
  telefono: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  telefono: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface CrearUsuarioPayload {
  nombre: string;
  telefono: string;
  password: string;
  rol?: RolUsuario;
}

export interface ActualizarUsuarioPayload {
  nombre?: string;
  telefono?: string;
  password?: string;
  rol?: RolUsuario;
}
