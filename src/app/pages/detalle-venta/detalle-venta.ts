import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
// import { VentaDetalleModel } from '../../models/venta/venta-response.model';

import { VentaDetalleResponse } from '../../models/venta/venta-detalle-response.model';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-detalle-venta',
  imports: [CommonModule],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.scss',
})
export class DetalleVenta implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  venta: VentaDetalleResponse | null = null;
  cargando = true;
  errorDetalle = '';

  constructor(
    private readonly ventaService: VentaService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
  ) {}

  ngOnInit(): void { this.cargarDetalle(); }

  cargarDetalle(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.errorDetalle = 'El identificador de la venta no es válido.';
      this.cargando = false;
      return;
    }
    this.cargando = true;
    this.errorDetalle = '';
    this.ventaService.obtenerVentaPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.venta = data; this.cargando = false; },
        error: error => {
          console.error('Error al obtener detalle de venta:', error);
          this.errorDetalle = 'No se pudo cargar el detalle de esta venta.';
          this.cargando = false;
        },
      });
  }

  volver(): void { this.location.back(); }

  get baseSinIva(): number {
    return this.venta?.items.reduce((acumulado, item) => acumulado + item.subtotal, 0) ?? 0;
  }
  get ivaTotal(): number {
    return this.venta?.items.reduce((acumulado, item) => acumulado + item.valorIva, 0) ?? 0;
  }
  get unidadesVendidas(): number {
    return this.venta?.items.reduce((acumulado, item) => acumulado + item.cantidad, 0) ?? 0;
  }
  get unidadesSinStock(): number {
    return this.venta?.items.reduce((acumulado, item) => acumulado + (item.cantidadSinStock ?? 0), 0) ?? 0;
  }
  get hayCoberturaHistoricaDesconocida(): boolean {
    return this.venta?.items.some(item => item.cantidadDescontada === null || item.cantidadSinStock === null) ?? false;
  }
  etiquetaEstado(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA': return 'Confirmada';
      case 'ANULADA': return 'Anulada';
      case 'BORRADOR': return 'Borrador';
      default: return estado;
    }
  }
}
