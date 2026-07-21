import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmptyStateComponent } from '../../../components/secundarios/empty-state/empty-state';

@Component({
  selector: 'app-proximamente',
  standalone: true,
  imports: [EmptyStateComponent],
  templateUrl: './proximamente.html',
})
export class ProximamenteComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly titulo = (this.route.snapshot.data['titulo'] as string) ?? 'Modulo';
  protected readonly icono = (this.route.snapshot.data['icono'] as string) ?? 'wrench';
}
