import { Component } from '@angular/core';
import { DetalleVentaModel } from '../../models/detalle-venta.model';
import { DetalleVentaService } from '../../services/detalle-venta.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-venta',
  imports: [],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.scss',
})
export class DetalleVenta {

  detalleVentas: DetalleVentaModel[] = [];

  constructor(
    private detalleVentaService: DetalleVentaService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const ventaId = this.route.snapshot.paramMap.get('id');
    if (ventaId) {
      this.cargarDetalle(Number(ventaId));
    }
  }

  cargarDetalle(id: number) {
    this.detalleVentaService.getByVentaId(id).subscribe(res => {
      this.detalleVentas = res;
    });
  }
}
