import { Component, Input } from '@angular/core';

import { BadgeTone } from '../../principales/badge/badge';
import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

@Component({
  selector: 'app-dashboard-stat-card',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './dashboard-stat-card.html',
  styleUrl: './dashboard-stat-card.css',
})
export class DashboardStatCardComponent {
  @Input() icono = 'chart-bar';
  @Input() tono: BadgeTone = 'ochre';
  @Input({ required: true }) etiqueta!: string;
  @Input({ required: true }) valor!: string | number;
}
