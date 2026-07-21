import { Component, Input } from '@angular/core';

import { BadgeComponent, BadgeTone } from '../../principales/badge/badge';
import { StatusProducto } from '../../../models/index.models';

const TONOS: Record<StatusProducto, BadgeTone> = {
  EXISTENCIA: 'gum',
  APARTADO: 'ochre',
  AGOTADO: 'basalt',
  ELIMINADO: 'danger',
};

const ETIQUETAS: Record<StatusProducto, string> = {
  EXISTENCIA: 'Existencia',
  APARTADO: 'Apartado',
  AGOTADO: 'Agotado',
  ELIMINADO: 'Eliminado',
};

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [BadgeComponent],
  templateUrl: './status-tag.html',
})
export class StatusTagComponent {
  @Input({ required: true }) status!: StatusProducto;

  protected get tono(): BadgeTone {
    return TONOS[this.status];
  }

  protected get etiqueta(): string {
    return ETIQUETAS[this.status];
  }
}
