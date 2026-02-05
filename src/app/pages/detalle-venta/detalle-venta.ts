import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { ActivatedRoute } from '@angular/router';
import { VentaDetalleModel } from '../../models/ventaDetalle.model';
import { DetalleVentaItemModel } from '../../models/DetalleVentaItem.model';

@Component({
  selector: 'app-detalle-venta',
  imports: [CommonModule],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.scss',
})
export class DetalleVenta {

  venta!: VentaDetalleModel;
  items: DetalleVentaItemModel[] = [];

  constructor(
    private detalleVentaService: DetalleVentaService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    this.detalleVentaService.obtenerDetalleVenta(id).subscribe(res => {
      this.venta = res;
      this.items = res.items;
    });
  }

}
