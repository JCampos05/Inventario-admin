import { Component, Input } from '@angular/core';
import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyStateComponent {
  @Input() icono = 'package';
  @Input({ required: true }) titulo!: string;
  @Input() descripcion?: string;
}
