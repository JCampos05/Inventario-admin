import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let siguienteId = 0;

@Component({
  selector: 'app-textarea',
  standalone: true,
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() rows = 4;

  protected readonly textareaId = `app-textarea-${siguienteId++}`;
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
