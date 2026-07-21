import { Component, Input } from '@angular/core';

export type BadgeTone = 'coffee' | 'ochre' | 'gum' | 'basalt' | 'danger' | 'warning';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'coffee';
}
