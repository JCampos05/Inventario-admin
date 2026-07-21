import { Component, inject } from '@angular/core';

import { PhosphorIconComponent } from '../../svgs/phosphor-icon';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-noti-toast',
  standalone: true,
  imports: [PhosphorIconComponent],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  protected iconoPara(tono: string): string {
    if (tono === 'exito') return 'check-circle';
    if (tono === 'error') return 'warning-circle';
    return 'info';
  }
}
