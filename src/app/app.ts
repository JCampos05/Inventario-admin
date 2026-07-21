import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TextScaleService } from './services/text-scale.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly textScaleService = inject(TextScaleService);

  protected readonly title = signal('admin');
}
