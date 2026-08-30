import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovimientoInventarioResponse } from '../../models/movimiento-inventario.model';
import { ProductoModel } from '../../models/producto/producto.model';
import { MovimientoInventarioService } from '../../services/movimiento-inventario.service';
import { ProductoService } from '../../services/producto.service';
import { DatePipe } from '@angular/common';
/** @author mau */
@Component({
  selector: 'app-movimiento-inventario',
  imports: [FormsModule, DatePipe],
  templateUrl: './movimiento-inventario.html',
  styleUrl: './movimiento-inventario.scss',
})
export class MovimientoInventario {

  movimientosResponse : MovimientoInventarioResponse[] = [];
  productos: ProductoModel[] = [];
  idProductoSeleccionado: number | null = null;

  constructor(
    private movimientosService: MovimientoInventarioService,
    private productoService: ProductoService
  ){}

  ngOnInit(){
    this.listarProductos()

  }

  listarPorProducto(idProducto:number){
    this.movimientosService.listarPorProducto(idProducto).subscribe({
      next: (data)  => {this.movimientosResponse = data},
      error: (e) => {console.error('Error al obtener movimiento:', e)}
    });
  };


  listarProductos() {
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (e) => {
        console.error('Error al obtener productos activos:', e);
      }
    });
  }

  cambiarProducto() {

    if (this.idProductoSeleccionado === null) {
      this.movimientosResponse = [];
      return;
    }

    this.listarPorProducto(this.idProductoSeleccionado);
  }


  mostrarOrigen(movimiento: MovimientoInventarioResponse): string {

    switch (movimiento.tipoOrigen) {

      case 'ENTRADA_INVENTARIO':
        return `Entrada #${movimiento.idOrigen}`;

      case 'AJUSTE_INVENTARIO':
        return `Ajuste #${movimiento.idOrigen}`;

      case 'VENTA':
        return `Venta #${movimiento.idOrigen}`;

      default:
        return `${movimiento.tipoOrigen} #${movimiento.idOrigen}`;
    }
  }

}
