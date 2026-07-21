import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBarComponent {
  @Input() placeholder = 'Buscar...';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  protected alEscribir(valor: string): void {
    this.value = valor;
    this.valueChange.emit(valor);
  }
}
