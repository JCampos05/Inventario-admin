import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

import { SpinnerComponent } from '../../principales/spinner/spinner';
import { EmptyStateComponent } from '../../secundarios/empty-state/empty-state';

export interface ColumnaTabla<T> {
  header: string;
  accessor: (fila: T) => string;
  align?: 'left' | 'right' | 'center';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, EmptyStateComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTableComponent<T> {
  @Input({ required: true }) columnas: ColumnaTabla<T>[] = [];
  @Input() filas: T[] = [];
  @Input() cargando = false;
  @Input() tituloVacio = 'Sin resultados';
  @Input() descripcionVacio = '';

  @ContentChild('acciones') plantillaAcciones?: TemplateRef<{ $implicit: T }>;
  @ContentChild('principal') plantillaPrincipal?: TemplateRef<{ $implicit: T }>;
}
