import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

let siguienteId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './input.html',
  styleUrl: './input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() hint: string | null = null;

  protected readonly inputId = `app-input-${siguienteId++}`;
  protected value = '';
  protected disabled = false;
  protected mostrarPassword = false;

  protected get tipoEfectivo(): string {
    if (this.type !== 'password') return this.type;
    return this.mostrarPassword ? 'text' : 'password';
  }

  protected alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected alCambiar(valor: string): void {
    this.value = valor;
    this.onChange(valor);
  }

  protected alTocar(): void {
    this.onTouched();
  }
}
