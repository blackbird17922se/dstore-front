import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntradaInventarioRequest } from '../../models/inventario/entrada-inventario-request.model';
import { EntradaInventarioService } from '../../services/entrada-inventario.service';
import { EntradaInventarioResponse } from '../../models/inventario/entrada-inventario-response.model';
import { ProductoService } from '../../services/producto.service';
import { ProductoModel } from '../../models/producto/producto.model';

/** @author Mauricio A */
@Component({
  selector: 'app-entrada-inventario',
  imports: [FormsModule],
  templateUrl: './entrada-inventario.html',
  styleUrl: './entrada-inventario.scss',
})
export class EntradaInventario {

  productos: ProductoModel[] = [];
  entradaInventarioResponse: EntradaInventarioResponse[] = [];
  entradaSeleccionada: EntradaInventarioResponse | null = null;

  modalAbierto = false;
  modalDetalleAbierto = false;


  entradaInventarioRequest: EntradaInventarioRequest = {
    fechaEntrada: '',
    numeroDocumento: '',
    observacion: '',
    detalles: []
  }

  constructor(
    private entradaInventarioService: EntradaInventarioService,
    private productoService: ProductoService
  ){}

  ngOnInit(){
    this.listar(),
    this.listarProductosActivos()
  }


  listar(){
    this.entradaInventarioService.listar().subscribe({
      next: (data) => {this.entradaInventarioResponse = data},
      error: (e) => {console.error('Error al obtener Entradas de inventario:', e)}
    })

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


  registrarEntrada(){
    const request: EntradaInventarioRequest = {
      fechaEntrada: this.entradaInventarioRequest.fechaEntrada,
      numeroDocumento: this.entradaInventarioRequest.numeroDocumento || null,
      observacion: this.entradaInventarioRequest.observacion || null,
      detalles: this.entradaInventarioRequest.detalles
    };

    const accion = this.entradaInventarioService.registrarEntrada(request);

    accion?.subscribe({
      next: () => {
        this.listar();
        this.cerrarModal()
      },
      error: (e) => {
        console.error('Error al registrar entrada en el inventario:', e);
      }
    })

  }


  agregarDetalle(){
    this.entradaInventarioRequest.detalles.push({
      idProducto: 0,
      cantidad: 1,
      numeroLote: null,
      fechaVencimiento: null
    });
  }

  eliminarDetalle(indice: number){
    this.entradaInventarioRequest.detalles.splice(indice, 1);
  }


  abrirModal() {
    this.resetEntradaInventario();
    this.agregarDetalle();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  private fechaActual(): string {

    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  resetEntradaInventario(){
    this.entradaInventarioRequest = {
      fechaEntrada: this.fechaActual(),
      numeroDocumento: '',
      observacion: '',
      detalles: []
    }
  }

  productoControlaVencimiento(idProducto: number): boolean {

    const producto = this.productos.find(
      producto => producto.id === idProducto
    );

    return producto?.controlaVencimiento ?? false;
  }

  verDetalle(entrada: EntradaInventarioResponse) {
    this.entradaSeleccionada = entrada;
    this.modalDetalleAbierto = true;
  }

  cerrarDetalle() {
    this.entradaSeleccionada = null;
    this.modalDetalleAbierto = false;
  }

}
