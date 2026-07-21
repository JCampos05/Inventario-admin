import { Injectable, signal } from '@angular/core';

export type ToastTono = 'exito' | 'error' | 'info';

export interface ToastMensaje {
  id: number;
  texto: string;
  tono: ToastTono;
}

let siguienteId = 0;

const MAX_VISIBLES = 3;
const DURACION_SALIDA_MS = 200;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly mensajes = signal<ToastMensaje[]>([]);
  readonly saliendo = signal<ReadonlySet<number>>(new Set());

  mostrar(texto: string, tono: ToastTono = 'info', duracionMs = 4000): void {
    const id = siguienteId++;
    this.mensajes.update((actuales) => [...actuales, { id, texto, tono }]);

    const visibles = this.mensajes().filter((m) => !this.saliendo().has(m.id));
    if (visibles.length > MAX_VISIBLES) {
      this.cerrar(visibles[0].id);
    }

    setTimeout(() => this.cerrar(id), duracionMs);
  }

  exito(texto: string): void {
    this.mostrar(texto, 'exito');
  }

  error(texto: string): void {
    this.mostrar(texto, 'error');
  }

  cerrar(id: number): void {
    if (this.saliendo().has(id)) return;

    this.saliendo.update((actuales) => new Set(actuales).add(id));

    setTimeout(() => {
      this.mensajes.update((actuales) => actuales.filter((mensaje) => mensaje.id !== id));
      this.saliendo.update((actuales) => {
        const copia = new Set(actuales);
        copia.delete(id);
        return copia;
      });
    }, DURACION_SALIDA_MS);
  }
}
