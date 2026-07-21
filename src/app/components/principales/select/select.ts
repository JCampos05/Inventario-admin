import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface OpcionSelect {
  value: string;
  label: string;
}

let siguienteId = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.html',
  styleUrl: './select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Selecciona una opcion';
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() opciones: OpcionSelect[] = [];

  protected readonly selectId = `app-select-${siguienteId++}`;
  protected value = '';
  protected disabled = false;

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
