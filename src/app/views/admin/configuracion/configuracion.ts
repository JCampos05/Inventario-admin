import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ColumnaTabla, DataTableComponent } from '../../../components/compuestos/data-table/data-table';
import { BadgeComponent, BadgeTone } from '../../../components/principales/badge/badge';
import { ButtonComponent } from '../../../components/principales/button/button';
import { InputComponent } from '../../../components/principales/input/input';
import { OpcionSelect, SelectComponent } from '../../../components/principales/select/select';
import { SpinnerComponent } from '../../../components/principales/spinner/spinner';
import { ToastService } from '../../../components/principales/toast/toast.service';
import { ApiErrorResponse, EstadoJob, JobLog, MONEDAS } from '../../../models/index.models';
import { ConfiguracionService } from '../../../services/index.services';
import { ESCALAS_TEXTO, EscalaTexto, TextScaleService } from '../../../services/text-scale.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    SpinnerComponent,
    DataTableComponent,
    BadgeComponent,
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class ConfiguracionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly toastService = inject(ToastService);
  protected readonly textScaleService = inject(TextScaleService);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly logs = signal<JobLog[]>([]);
  protected readonly cargandoLogs = signal(true);

  protected readonly opcionesMoneda: OpcionSelect[] = MONEDAS;
  protected readonly escalasTexto = ESCALAS_TEXTO;

  protected readonly formulario = this.fb.group({
    nombreNegocio: ['', Validators.required],
    whatsappAdmin: ['', Validators.required],
    horarioAtencion: [''],
    logoUrl: [''],
    moneda: ['', Validators.required],
    diasRetencionEliminados: [30, [Validators.required, Validators.min(1)]],
  });

  protected readonly columnasLogs: ColumnaTabla<JobLog>[] = [
    { header: 'Job', accessor: (l) => l.nombreJob },
    { header: 'Mensaje', accessor: (l) => l.mensaje },
    { header: 'Fecha', accessor: (l) => this.formatearFecha(l.ejecutadoEn) },
  ];

  ngOnInit(): void {
    this.cargar();
    this.cargarLogs();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.configuracionService.obtener().subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.success) {
          this.formulario.patchValue({
            nombreNegocio: respuesta.data.nombreNegocio,
            whatsappAdmin: respuesta.data.whatsappAdmin,
            horarioAtencion: respuesta.data.horarioAtencion ?? '',
            logoUrl: respuesta.data.logoUrl ?? '',
            moneda: respuesta.data.moneda,
            diasRetencionEliminados: respuesta.data.diasRetencionEliminados,
          });
        }
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarLogs(): void {
    this.cargandoLogs.set(true);
    this.configuracionService.logs().subscribe({
      next: (respuesta) => {
        this.cargandoLogs.set(false);
        if (respuesta.success) {
          this.logs.set(respuesta.data);
        }
      },
      error: () => this.cargandoLogs.set(false),
    });
  }

  protected tonoEstado(estado: EstadoJob): BadgeTone {
    return estado === 'EXITOSO' ? 'gum' : 'danger';
  }

  protected formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected cambiarEscalaTexto(escala: EscalaTexto): void {
    this.textScaleService.establecer(escala);
  }

  protected guardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    const valores = this.formulario.getRawValue();
    this.guardando.set(true);

    this.configuracionService
      .actualizar({
        nombreNegocio: valores.nombreNegocio!,
        whatsappAdmin: valores.whatsappAdmin!,
        horarioAtencion: valores.horarioAtencion || null,
        logoUrl: valores.logoUrl || null,
        moneda: valores.moneda!,
        diasRetencionEliminados: Number(valores.diasRetencionEliminados),
      })
      .subscribe({
        next: (respuesta) => {
          this.guardando.set(false);
          if (respuesta.success) {
            this.toastService.exito('Configuracion actualizada correctamente');
          } else {
            this.toastService.error(respuesta.message);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          const cuerpo = error.error as ApiErrorResponse | undefined;
          this.toastService.error(cuerpo?.message ?? 'No se pudo actualizar la configuracion');
        },
      });
  }
}
