import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent, ButtonVariant } from '../../principales/button/button';
import { ModalComponent } from '../../principales/modal/modal';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})
export class ConfirmationModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmar accion';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmVariant: ButtonVariant = 'primary';
  @Input() loading = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
