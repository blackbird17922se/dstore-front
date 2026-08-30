import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExistenciaProductoResponse } from '../../models/existencia-producto-response.model';
import { ExistenciaProductoService } from '../../services/existencia-producto.service';
import { DatePipe } from '@angular/common';
import { ProductoModel } from '../../models/producto/producto.model';
import { ProductoService } from '../../services/producto.service';


@Component({
  selector: 'app-existencias',
  imports: [FormsModule, DatePipe],
  templateUrl: './existencias.html',
  styleUrl: './existencias.scss',
})
export class Existencias {

  existenciasResponse: ExistenciaProductoResponse[] = [];
  existenciasMostradas: ExistenciaProductoResponse[] = [];
  existenciaSeleccionada: ExistenciaProductoResponse | null = null;
  productos: ProductoModel[] = [];

  idProductoSeleccionado: number | null = null;
  soloDisponibles = false;

  constructor(
    private existenciaService: ExistenciaProductoService,
    private productoService: ProductoService
  ){}

  ngOnInit(){
    this.listarExistencias(),
    this.listarProductosActivos()
  }


  listarExistencias(){
    this.existenciaService.listarExistencias().subscribe({
      next: (data) => {
        this.existenciasResponse = data;
        this.aplicarFiltros();
      },
      error: (e) => {console.error('Error al obtener existencias:', e)}
    })
  }

  obtenerExistencia(id: number){
    this.existenciaService.obtenerExistencia(id).subscribe({
      next: (data) => {this.existenciaSeleccionada = data},
      error: (e) => {console.error('Error al obtener existencia:', e)}
    });
  }

  filtrarPorProducto() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {

    let resultado = [...this.existenciasResponse];

    if (this.idProductoSeleccionado !== null) {

      resultado = resultado.filter(
        existencia =>
          existencia.idProducto === this.idProductoSeleccionado
      );

    }

    if (this.soloDisponibles) {

      resultado = resultado.filter(
        existencia => existencia.cantidad > 0
      );

    }

    this.existenciasMostradas = resultado;
  }

  listarProductosActivos() {
    this.productoService.listarProductosActivos().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (e) => {
        console.error('Error al obtener productos activos:', e);
      }
    });
  }
 

}
