import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResumen } from '../../models/dashboard/dashboard-resumen.model';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  resumen: DashboardResumen | null = null;
  cargandoResumen = false;
  errorResumen = '';

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.actualizarResumen();
  }

  /** Solo indicadores agregados; no carga todas las ventas ni existencias. */
  actualizarResumen(): void {
    if (this.cargandoResumen) return;

    this.cargandoResumen = true;
    this.errorResumen = '';

    this.dashboardService.obtenerResumen().subscribe({
      next: data => {
        this.resumen = data;
        this.cargandoResumen = false;
      },
      error: error => {
        console.error('Error al consultar el dashboard:', error);
        this.errorResumen = 'No fue posible consultar los indicadores. Puedes reintentar.';
        this.cargandoResumen = false;
      }
    });
  }
}
