import { Component } from '@angular/core';
import { ClienteResponse } from '../../models/cliente/cliente-response.model';
import { ItemCarrito } from '../../models/ItemCarrito.model';
import { ProductoService } from '../../services/producto.service';
import { ClienteService } from '../../services/cliente.service';
import { VentaService } from '../../services/venta.service';
import { VentaRequest } from '../../models/venta/venta-request.model';
import { ProductoModel } from '../../models/producto/producto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nueva-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-venta.html',
  styleUrl: './nueva-venta.scss',
})
export class NuevaVenta {

  productos: ProductoModel[] = [];
  clientes: ClienteResponse[] = [];
  carrito: ItemCarrito[] = [];

  codigoBuscado = '';
  idClienteSeleccionado: number | null = null;
  observacion: string | null = null;
  ingresoCliente = 0;

  constructor(
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private ventaService: VentaService
  ) { }

  ngOnInit() {
    this.listarProductos();
    this.listarClientes();
  }

  /** Productos Activos para la tabla de nuevas ventas */
  listarProductos() {

    this.productoService
      .listarProductosActivos()
      .subscribe({

        next: data => {
          this.productos = data;
        },

        error: e => {
          console.error(
            'Error al obtener productos:',
            e
          );
        }
      });
  }

  listarClientes() {

    this.clienteService
      .listarClientesActivos()
      .subscribe({

        next: data => {
          this.clientes = data;
        },

        error: e => {
          console.error(
            'Error al obtener clientes:',
            e
          );
        }
      });
  }

  agregarAlCarrito(producto: ProductoModel) {

    const item = this.carrito.find(
      i => i.producto.id === producto.id
    );

    if (item) {

      item.cantidad++;

    } else {

      this.carrito.push({
        producto,
        cantidad: 1
      });
    }
  }

  eliminarItem(item: ItemCarrito) {

    this.carrito =
      this.carrito.filter(i => i !== item);
  }
  calcularSubtotal(
    item: ItemCarrito
  ): number {

    return item.producto.precio *
      item.cantidad;
  }

  get totalGeneral(): number {

    return this.carrito.reduce(
      (total, item) =>
        total +
        (
          item.producto.precio *
          item.cantidad
        ),
      0
    );
  }

  procesarVenta() {

    if (this.carrito.length === 0) {

      alert('El carrito está vacío.');

      return;
    }


    const request: VentaRequest = {

      idCliente:
        this.idClienteSeleccionado,

      observacion:
        this.observacion?.trim() || null,

      detalles:
        this.carrito.map(item => ({

          idProducto: item.producto.id!,

          cantidad: item.cantidad

        }))
    };


    this.ventaService
      .registrarVenta(request)
      .subscribe({

        next: response => {

          alert(response.mensaje);

          this.limpiarVenta();

        },

        error: error => {

          console.error(
            'Error al procesar la venta:',
            error
          );

          alert(
            'No se pudo registrar la venta.'
          );
        }

      });
  }

  limpiarVenta() {

    this.carrito = [];

    this.codigoBuscado = '';

    this.idClienteSeleccionado = null;

    this.observacion = null;

    this.ingresoCliente = 0;

    this.listarProductos();
  }


}
