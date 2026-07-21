import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import { SidebarComponent } from '../../../components/compuestos/sidebar/sidebar';
import { ToastComponent } from '../../../components/principales/toast/toast';
import { TopbarComponent } from '../../../components/secundarios/topbar/topbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sidebarAbierto = signal(false);

  protected get nombreUsuario(): string {
    return this.authService.usuario()?.nombre ?? '';
  }

  protected cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
