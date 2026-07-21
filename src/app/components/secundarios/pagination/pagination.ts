import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;
  @Output() paginaChange = new EventEmitter<number>();

  protected ir(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaActual) return;
    this.paginaChange.emit(pagina);
  }
}
