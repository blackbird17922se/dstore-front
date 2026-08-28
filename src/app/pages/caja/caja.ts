import { Component } from '@angular/core';
import { ProductoModel } from '../../models/producto/producto.model';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoConStockModel } from '../../models/ProductoConStock.model';
import { ItemCarrito } from '../../models/ItemCarrito.model';
import { CajaService } from '../../services/caja.service';
import { CajaModel } from '../../models/caja.model';


@Component({
  selector: 'app-caja',
  imports: [CommonModule, FormsModule],
  templateUrl: './caja.html',
  styleUrl: './caja.scss',
})
export class Caja {

  productosStock: ProductoConStockModel[] = [];
  carrito: ItemCarrito[] = [];
  productos: ProductoModel[] = [];
  codigoBuscado: string = '';
  ingresoCliente: number = 0;
  cajaModel: CajaModel[] = [];

  cliente: string = '';


  constructor(
    private productoService: ProductoService,
    private cajaService: CajaService,
  ) { }

  ngOnInit() {
    this.getProductos();
  }

  getProductos() {
    this.productoService.getAllConStock().subscribe({
      next: (data) => { this.productosStock = data; },
      error: (e) => console.error(e)
    });
  }

  agregarAlCarrito(prod: ProductoConStockModel) {
    // buscar si ya existe en el carrito
    const item = this.carrito.find(i => i.producto.id === prod.id);

    if (item) {
      item.cantidad++; // aumenta cantidad
    } else {
      this.carrito.push({
        producto: prod,
        cantidad: 1
      });
    }
  }

  actualizarSubtotal(item: ItemCarrito) {
    // No eliminar aún
    if (!item.cantidad || item.cantidad <= 0) {
      item.cantidad = 0; // valor temporal durante edición
    }
  }

  validarCantidad(item: ItemCarrito) {
    // Al salir del campo, ahora sí corregimos
    if (!item.cantidad || item.cantidad <= 0) {
      item.cantidad = 1;
    }
  }

  actualizarCantidad(item: ItemCarrito, valor: any) {
    const cantidad = Number(valor);

    // Si está vacío, no tocamos la cantidad original
    if (valor === "" || valor === null) {
      return;
    }

    // Si es número válido, actualizamos
    if (!isNaN(cantidad) && cantidad > 0) {
      item.cantidad = cantidad;
    }
  }

  calcularSubtotal(item: ItemCarrito) {
    return item.cantidad ? item.producto.precio * item.cantidad : 0;
  }

  cambiarCantidad(item: ItemCarrito, nuevaCantidad: number) {
    item.cantidad = Number(nuevaCantidad);

    if (item.cantidad <= 0) {
      this.eliminarItem(item);
    }
  }

  eliminarItem(item: ItemCarrito) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  get totalGeneral() {
    return this.carrito.reduce((sum, item) =>
      sum + (item.producto.precio * item.cantidad), 0
    );
  }

  buscarPorCodigo() {
    if (!this.codigoBuscado.trim()) return;

    const encontrado = this.productosStock.find(
      p => p.codigoBarras === this.codigoBuscado
    );

    if (encontrado) {
      this.agregarAlCarrito(encontrado);
      this.codigoBuscado = ''; // limpiar
    } else {
      alert("Producto no encontrado");
    }
  }

  get cambio() {
    if (this.ingresoCliente <= 0) return 0;
    return this.ingresoCliente - this.totalGeneral;
  }

  procesarVenta() {
    if (this.carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const venta: CajaModel = {
      cliente: this.cliente || null,
      productos: this.carrito.map(item => ({
        idProducto: item.producto.id,
        cantidad: item.cantidad
      }))
    };


    this.cajaService.create(venta).subscribe({
      next: (res) => {
        alert(res.mensaje);
        this.carrito = [];
        this.ingresoCliente = 0;
        this.getProductos();
      },
      error: (error) => {
        console.error(error);
        alert("Error al procesar la venta.");
      }
    });

  }

}
