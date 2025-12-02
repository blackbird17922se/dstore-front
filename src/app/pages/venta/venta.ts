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
import { ProductoConStockModel } from '../../models/ProductoConStock.model';

@Component({
  selector: 'app-venta',
  imports: [],
  templateUrl: './venta.html',
  styleUrl: './venta.scss',
})
export class Venta {

  productos: ProductoConStockModel[] = [];
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
    tipoProducto: { id: 0 },
    presentacion: { id: 0 },
    marca: { id: 0 }
  };

  constructor(
    private productoService: ProductoService,
    private marcaService: MarcaService,
    private tipoProductoService: TipoProductoService,
    private presentacionService: PresentacionService
  ) { }

  ngOnInit() {
    this.getProductos();

  }

  getProductos() {
      this.productoService.getAllConStock().subscribe({
        next: (data) => { this.productos = data; },
        error: (e) => console.error(e)
    });
  }






}
