import { Component } from '@angular/core';
import { ProductoModel } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarcaModel } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';
import { TipoProductoModel } from '../../models/tipo-producto.model';
import { TipoProductoService } from '../../services/tipo-producto.service';
import { PresentacionModel } from '../../models/presentacion.model';
import { PresentacionService } from '../../services/presentacion.service';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrls: ['./producto.scss'],
})
export class Producto {

  productos: ProductoModel[] = [];
  marcas: MarcaModel[] = [];
  tipoProductos: TipoProductoModel[] = [];
  presentaciones: PresentacionModel[] = [];

  modalAbierto = false;
  editando = false;
  productoActual: ProductoModel = {
    id: null,
    codigoBarras: '',
    nombre: '',
    descripcion: '',
    iva: 0,
    precio: 0,
    stock: 0,
    tipoProducto: {id:0},
    presentacion: {id:0},
    marca: {id:0}
  };

  constructor(
    private productoService: ProductoService,
    private marcaService: MarcaService,
    private tipoProductoService: TipoProductoService,
    private presentacionService: PresentacionService
  ) {}

  ngOnInit() {
    this.getProductos();
    this.getMarcas();
    this.getTiposProductos();
    this.getPresentaciones();
  }

  getMarcas(){
    this.marcaService.getAll().subscribe({
      next: (data) => {this.marcas = data;},
      error: (error) => {console.error('Error al obtener Marcas:', error);}
    })
  }

  getTiposProductos(){
    this.tipoProductoService.getAll().subscribe({
      next: (data) => {this.tipoProductos = data;},
      error: (error) => {console.error('Error al obtener Tipos de Productos:', error);}
    });
  }

  getPresentaciones(){
    this.presentacionService.getAll().subscribe({
      next: (data) => {this.presentaciones = data;},
      error: (error) => {console.error('Error al obtener Presentaciones:', error);}
    });
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
    const accion = this.editando
      ? this.productoService.update(this.productoActual)
      : this.productoService.create(this.productoActual);
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

  borrarProducto(id: number | null) {
    if (id === null) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta producto?')) {
      this.productoService.delete(id).subscribe({
        next: () => {
          this.getProductos();
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
        }
      });
    }
  }

  resetProductoActual() {
    this.productoActual = {
      id: null,
      codigoBarras: '',
      nombre: '',
      descripcion: '',
      iva: 0,
      precio: 0,
      stock: 0,
      tipoProducto: {id:0},
      presentacion: {id:0},
      marca: {id:0}
    };
  }
}
