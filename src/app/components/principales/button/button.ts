import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() href: string | null = null;
  @Input() routerLink: string | string[] | null = null;
  @Input() target: '_self' | '_blank' = '_self';
}
