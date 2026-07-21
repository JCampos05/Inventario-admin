import { Injectable, signal } from '@angular/core';

export type EscalaTexto = 'pequeno' | 'normal' | 'grande' | 'extra-grande';

const CLAVE_ALMACENAMIENTO = 'admin_escala_texto';

const PORCENTAJES: Record<EscalaTexto, string> = {
  pequeno: '93.75%',
  normal: '100%',
  grande: '112.5%',
  'extra-grande': '125%',
};

export const ESCALAS_TEXTO: { value: EscalaTexto; label: string }[] = [
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'normal', label: 'Normal' },
  { value: 'grande', label: 'Grande' },
  { value: 'extra-grande', label: 'Extra grande' },
];

@Injectable({ providedIn: 'root' })
export class TextScaleService {
  readonly escala = signal<EscalaTexto>(this.leerGuardada());

  constructor() {
    this.aplicar(this.escala());
  }

  establecer(escala: EscalaTexto): void {
    this.escala.set(escala);
    localStorage.setItem(CLAVE_ALMACENAMIENTO, escala);
    this.aplicar(escala);
  }

  private aplicar(escala: EscalaTexto): void {
    document.documentElement.style.fontSize = PORCENTAJES[escala];
  }

  private leerGuardada(): EscalaTexto {
    const guardada = localStorage.getItem(CLAVE_ALMACENAMIENTO) as EscalaTexto | null;
    return guardada && guardada in PORCENTAJES ? guardada : 'normal';
  }
}
