import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { ActivatedRoute } from '@angular/router';
// import { VentaDetalleModel } from '../../models/venta/venta-response.model';
import { DetalleVentaItemModel } from '../../models/DetalleVentaItem.model';
import { VentaDetalleResponse } from '../../models/venta/venta-detalle-response.model';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-detalle-venta',
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.scss',
})
export class DetalleVenta {

  venta: VentaDetalleResponse | null = null;

  constructor(
    private ventaService: VentaService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.ventaService
      .obtenerVentaPorId(id)
      .subscribe({

        next: data => {
          this.venta = data;
        },

        error: e => {
          console.error(
            'Error al obtener detalle de venta:',
            e
          );
        }

      });
  }

}
