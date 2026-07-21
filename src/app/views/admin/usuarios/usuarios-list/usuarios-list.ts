import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UsuarioFormComponent } from '../../../../components/compuestos/usuario-form/usuario-form';
import { ColumnaTabla, DataTableComponent } from '../../../../components/compuestos/data-table/data-table';
import { ConfirmationModalComponent } from '../../../../components/modales/confirmation-modal/confirmation-modal';
import { BadgeComponent } from '../../../../components/principales/badge/badge';
import { ButtonComponent } from '../../../../components/principales/button/button';
import { ModalComponent } from '../../../../components/principales/modal/modal';
import { SpinnerComponent } from '../../../../components/principales/spinner/spinner';
import { ToastService } from '../../../../components/principales/toast/toast.service';
import { SearchBarComponent } from '../../../../components/secundarios/search-bar/search-bar';
import { PhosphorIconComponent } from '../../../../components/svgs/phosphor-icon';
import { Usuario } from '../../../../models/index.models';
import { UsuariosService } from '../../../../services/index.services';
import { AuthService } from '../../../../auth/auth.service';

type ModoModal = 'ver' | 'editar' | 'crear';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    FormsModule,
    DataTableComponent,
    ConfirmationModalComponent,
    ModalComponent,
    UsuarioFormComponent,
    ButtonComponent,
    BadgeComponent,
    SearchBarComponent,
    SpinnerComponent,
    PhosphorIconComponent,
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosListComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly busqueda = signal('');
  protected readonly usuarioADesactivar = signal<Usuario | null>(null);
  protected readonly cambiandoStatus = signal(false);

  protected readonly modalAbierto = signal(false);
  protected readonly modoModal = signal<ModoModal>('ver');
  protected readonly usuarioModal = signal<Usuario | null>(null);
  protected readonly cargandoModal = signal(false);

  protected readonly columnas: ColumnaTabla<Usuario>[] = [
    { header: 'Nombre', accessor: (u) => u.nombre },
    { header: 'Telefono', accessor: (u) => u.telefono },
    { header: 'Rol', accessor: (u) => u.rol },
  ];

  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.usuarios();

    return this.usuarios().filter((u) => {
      return u.nombre.toLowerCase().includes(texto) || u.telefono.includes(texto);
    });
  });

  protected readonly tituloModal = computed(() => {
    if (this.modoModal() === 'crear') return 'Nuevo usuario';
    if (this.modoModal() === 'editar') return 'Editar usuario';
    return this.usuarioModal()?.nombre ?? 'Usuario';
  });

  ngOnInit(): void {
    this.cargar();

    this.route.paramMap.subscribe((params) => {
      const publicId = params.get('publicId');
      const esCrear = this.route.snapshot.data['modo'] === 'crear';

      if (esCrear) {
        this.modalAbierto.set(true);
        this.modoModal.set('crear');
        this.usuarioModal.set(null);
        return;
      }

      if (publicId) {
        const estado = history.state as { modo?: 'ver' | 'editar' } | null;
        const modo = estado?.modo === 'editar' ? 'editar' : 'ver';
        this.abrirModalParaId(publicId, modo);
        return;
      }

      this.modalAbierto.set(false);
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.usuarios.set(respuesta.data);
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private abrirModalParaId(publicId: string, modo: 'ver' | 'editar'): void {
    this.modalAbierto.set(true);
    this.modoModal.set(modo);
    this.cargandoModal.set(true);
    this.usuarioModal.set(null);

    this.usuariosService.obtener(publicId).subscribe({
      next: (respuesta) => {
        this.cargandoModal.set(false);
        if (respuesta.success) {
          this.usuarioModal.set(respuesta.data);
        } else {
          this.toastService.error(respuesta.message);
          this.cerrarModal();
        }
      },
      error: () => {
        this.cargandoModal.set(false);
        this.toastService.error('No se pudo cargar el usuario');
        this.cerrarModal();
      },
    });
  }

  protected esUsuarioActual(usuario: Usuario): boolean {
    return this.authService.usuario()?.publicId === usuario.publicId;
  }

  protected abrirCrear(): void {
    this.router.navigate(['/usuarios', 'nuevo']);
  }

  protected abrirVer(usuario: Usuario): void {
    this.router.navigate(['/usuarios', usuario.publicId], { state: { modo: 'ver' } });
  }

  protected abrirEditar(usuario: Usuario): void {
    this.router.navigate(['/usuarios', usuario.publicId], { state: { modo: 'editar' } });
  }

  protected pasarAEditar(): void {
    this.modoModal.set('editar');
  }

  protected cerrarModal(): void {
    this.router.navigate(['/usuarios']);
  }

  protected alCancelarFormulario(): void {
    if (this.modoModal() === 'editar' && this.usuarioModal()) {
      this.modoModal.set('ver');
      return;
    }
    this.cerrarModal();
  }

  protected alGuardarFormulario(usuario: Usuario): void {
    this.usuarios.update((actuales) => {
      const existe = actuales.some((u) => u.publicId === usuario.publicId);
      return existe
        ? actuales.map((u) => (u.publicId === usuario.publicId ? usuario : u))
        : [usuario, ...actuales];
    });
    this.cerrarModal();
  }

  protected alternarStatus(usuario: Usuario): void {
    if (usuario.activo) {
      this.usuarioADesactivar.set(usuario);
      return;
    }
    this.aplicarCambioStatus(usuario, true);
  }

  protected get mensajeDesactivacion(): string {
    const nombre = this.usuarioADesactivar()?.nombre ?? '';
    return `Se desactivara el acceso de "${nombre}" al panel de administracion.`;
  }

  protected confirmarDesactivacion(): void {
    const usuario = this.usuarioADesactivar();
    if (!usuario) return;
    this.aplicarCambioStatus(usuario, false);
  }

  private aplicarCambioStatus(usuario: Usuario, activo: boolean): void {
    this.cambiandoStatus.set(true);
    this.usuariosService.cambiarStatus(usuario.publicId, activo).subscribe({
      next: (respuesta) => {
        this.cambiandoStatus.set(false);
        this.usuarioADesactivar.set(null);
        if (respuesta.success) {
          this.usuarios.update((actuales) =>
            actuales.map((u) => (u.publicId === usuario.publicId ? respuesta.data : u)),
          );
          if (this.usuarioModal()?.publicId === usuario.publicId) {
            this.usuarioModal.set(respuesta.data);
          }
          this.toastService.exito('Status actualizado correctamente');
        } else {
          this.toastService.error(respuesta.message);
        }
      },
      error: () => {
        this.cambiandoStatus.set(false);
        this.usuarioADesactivar.set(null);
        this.toastService.error('No se pudo actualizar el status');
      },
    });
  }
}
