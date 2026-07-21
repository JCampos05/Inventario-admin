import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PhosphorIconComponent } from '../../svgs/phosphor-icon';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'md' | 'lg' = 'md';
  @Input() closeOnBackdrop = true;
  @Output() closed = new EventEmitter<void>();

  protected alClicBackdrop(): void {
    if (this.closeOnBackdrop) {
      this.closed.emit();
    }
  }
}
