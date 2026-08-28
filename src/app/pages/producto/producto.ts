import { Component } from '@angular/core';
import { ProductoModel } from '../../models/producto/producto.model';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarcaModel } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';
import { CategoriaModel } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { PresentacionModel } from '../../models/presentacion.model';
import { PresentacionService } from '../../services/presentacion.service';
import { TarifaIvaModel } from '../../models/tarifaIva.model';
import { TarifaIvaService } from '../../services/tarifaIva.service';
import { ProductoRequest } from '../../models/producto/producto-request.model';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrls: ['./producto.scss'],
})
export class Producto {

  productos: ProductoModel[] = [];
  marcas: MarcaModel[] = [];
  categorias: CategoriaModel[] = [];
  presentaciones: PresentacionModel[] = [];
  tarifasIva: TarifaIvaModel[] = [];

  modalAbierto = false;
  editando = false;
  productoActual: ProductoModel = {
    id: null,
    codigoBarras: '',
    nombre: '',
    descripcion: '',

    precio: 0,
    stock: 0,

    idCategoria: null,
    nombreCategoria: '',

    idPresentacion: null,
    nombrePresentacion: '',

    idMarca: null,
    nombreMarca: '',

    activo: true,

    idTarifaIva: null,
    nombreTarifaIva: '',
    porcentajeIva: 0,

    controlaVencimiento: false
  };

  constructor(
    private productoService: ProductoService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService,
    private presentacionService: PresentacionService,
    private tarifasIvaService: TarifaIvaService
  ) {}

  ngOnInit() {
    this.getProductos();
    this.listarMarcasActivas();
    this.listarCategoriasActivas();
    this.listarPresentacionesActivas();
    this.listarTarifasIvaActivas();
  }

  listarMarcasActivas(){
    this.marcaService.listarMarcasActivas().subscribe({
      next: (data) => {this.marcas = data;},
      error: (error) => {console.error('Error al obtener Marcas Activas:', error);}
    });
  }

  listarCategoriasActivas(){
    this.categoriaService.listarCategoriasActivas().subscribe({
      next: (data) => {this.categorias = data;},
      error: (error) => {console.error('Error al obtener Categorías:', error);}
    })
  }

  listarPresentacionesActivas(){
    this.presentacionService.listarPresentacionesActivas().subscribe({
      next: (data) => {this.presentaciones = data;},
      error: (error) => {console.error('Error al obtener Presentaciones:', error);}
    });
  }

  listarTarifasIvaActivas(){
    this.tarifasIvaService.listarTarifasIvaActivas().subscribe({
      next:(data) => {this.tarifasIva = data;},
      error: (e) => {console.error('Error al obtener tarifas IVA activas:', e)}
    })
  }

  abrirModal() {
    this.editando = false;
    this.resetProductoActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  getProductos() {
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (error) => {
        console.error('Error al obtener Productos:', error);
      }
    });
  }

  editarProducto(Producto: ProductoModel) {
    this.editando = true;
    this.productoActual = { ...Producto };
    this.modalAbierto = true;
  }

  guardarProducto() {

    const request: ProductoRequest = {
      codigoBarras: this.productoActual.codigoBarras || null,
      nombre: this.productoActual.nombre,
      descripcion: this.productoActual.descripcion,
      precio: this.productoActual.precio,

      idCategoria: this.productoActual.idCategoria,
      idPresentacion: this.productoActual.idPresentacion,
      idMarca: this.productoActual.idMarca,
      idTarifaIva: this.productoActual.idTarifaIva,

      controlaVencimiento: this.productoActual.controlaVencimiento
    };

    const accion = this.editando
      ? this.productoService.update(this.productoActual.id!, request)
      : this.productoService.create(request);

    accion.subscribe({
      next: () => {
        this.getProductos();
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al guardar producto:', error);
      }
    });
  }

  cambiarEstadoProducto(producto: ProductoModel){

    if (producto.id == null) {
      return;
    }

    const nuevoEstado = !producto.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que deseas ${accion} este Producto?`)) {
      
      this.productoService.cambiarEstado(producto.id, nuevoEstado)
        .subscribe({
          next: () => {
            this.getProductos();
          },

          error: (e) => {
            console.error(
              'Error al cambiar el estado del Producto:',
              e
            )
          }
        })
    }
  }

  mostrarIva(producto: ProductoModel): string {

    if (producto.nombreTarifaIva === 'EXENTO') {
      return 'Exento';
    }

    if (producto.nombreTarifaIva === 'EXCLUIDO') {
      return 'Excluido';
    }

    return `${producto.porcentajeIva}%`;
  }

  mostrarTarifa(tarifa: TarifaIvaModel): string {

    if (tarifa.tipo === 'EXENTO') {
      return 'Exento';
    }

    if (tarifa.tipo === 'EXCLUIDO') {
      return 'Excluido';
    }

    return `${tarifa.nombre} - ${tarifa.porcentaje}%`;
  }


  resetProductoActual() {
    this.productoActual = {
      id: null,
      codigoBarras: '',
      nombre: '',
      descripcion: '',
      idTarifaIva: 0,
      precio: 0,
      stock: 0,
      
      idCategoria: 0,
      nombreCategoria: '',
      
      idPresentacion: 0,
      nombrePresentacion: '',

      nombreMarca: '',
      activo: true,
      porcentajeIva: 0,
      nombreTarifaIva: '',
      idMarca: 0,
      controlaVencimiento: false
    };
  }
}
