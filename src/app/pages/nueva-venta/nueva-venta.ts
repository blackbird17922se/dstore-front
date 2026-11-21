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

/** Información estimada a partir del catálogo; el backend registra el faltante real. */
interface FaltanteVenta {
  idProducto: number;
  nombre: string;
  codigoBarras: string;
  disponible: number;
  solicitado: number;
  faltante: number;
}

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
  filtroCatalogo = '';
  idClienteSeleccionado: number | null = null;
  observacion: string | null = null;
  ingresoCliente = 0;

  revisandoStock = false;
  procesandoVenta = false;
  confirmacionAbierta = false;
  faltantesConfirmacion: FaltanteVenta[] = [];
  aceptaFaltantes = false;
  mensajeError = '';
  mensajeExito = '';
  avisoExito = '';
  errorCatalogo = '';

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
    this.productoService.listarProductosActivos().subscribe({
      next: data => {
        this.productos = data;
        this.errorCatalogo = '';
        // Sincronizar solo el stock para no alterar el precio del carrito silenciosamente.
        this.carrito.forEach(item => {
          const actualizado = data.find(p => p.id === item.producto.id);
          if (actualizado) item.producto.stock = actualizado.stock;
        });
      },
      error: e => {
        console.error('Error al obtener productos:', e);
        this.errorCatalogo = 'No se pudo actualizar el catálogo de productos.';
      }
    });
  }

  listarClientes() {
    this.clienteService.listarClientesActivos().subscribe({
      next: data => { this.clientes = data; },
      error: e => { console.error('Error al obtener clientes:', e); }
    });
  }

  get productosFiltrados(): ProductoModel[] {
    const texto = this.filtroCatalogo.trim().toLocaleLowerCase();
    if (!texto) return this.productos;
    return this.productos.filter(p =>
      p.nombre.toLocaleLowerCase().includes(texto)
      || (p.codigoBarras || '').toLocaleLowerCase().includes(texto)
      || (p.descripcion || '').toLocaleLowerCase().includes(texto)
    );
  }

  agregarAlCarrito(producto: ProductoModel) {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.avisoExito = '';
    if (producto.id === null) return;

    const item = this.carrito.find(i => i.producto.id === producto.id);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  eliminarItem(item: ItemCarrito) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  calcularSubtotal(item: ItemCarrito): number {
    return item.producto.precio * item.cantidad;
  }

  get totalGeneral(): number {
    return this.carrito.reduce((total, item) =>
      total + item.producto.precio * (Number(item.cantidad) || 0), 0);
  }

  get carritoValido(): boolean {
    return this.carrito.length > 0 && this.carrito.every(item =>
      item.producto.id !== null
      && Number.isSafeInteger(item.cantidad)
      && item.cantidad > 0
      && Number.isFinite(item.producto.precio)
      && item.producto.precio >= 0
    );
  }

  stockDisponible(producto: ProductoModel): number {
    return Math.max(0, Number(producto.stock) || 0);
  }

  get faltantesEstimados(): FaltanteVenta[] {
    return this.carrito
      .map(item => {
        const disponible = this.stockDisponible(item.producto);
        const solicitado = Number.isSafeInteger(item.cantidad) && item.cantidad > 0
          ? item.cantidad : 0;
        return {
          idProducto: item.producto.id!,
          nombre: item.producto.nombre,
          codigoBarras: item.producto.codigoBarras,
          disponible,
          solicitado,
          faltante: Math.max(0, solicitado - disponible),
        };
      })
      .filter(item => item.faltante > 0);
  }

  get totalUnidadesSinStock(): number {
    return this.faltantesEstimados.reduce((total, item) => total + item.faltante, 0);
  }

  get totalFaltantesConfirmacion(): number {
    return this.faltantesConfirmacion.reduce((total, item) => total + item.faltante, 0);
  }

  /** El catálogo incluye productos con stock 0: la venta no debe ocultarlos. */
  etiquetaStock(producto: ProductoModel): string {
    const stock = this.stockDisponible(producto);
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Stock bajo';
    return 'Disponible';
  }

  /** Validar y consultar stock de nuevo antes de confirmar; no confiar en datos antiguos. */
  procesarVenta() {
    if (this.revisandoStock || this.procesandoVenta || this.confirmacionAbierta) return;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.avisoExito = '';

    if (!this.carritoValido) {
      this.mensajeError = 'Revisa el carrito: cada producto debe tener una cantidad entera mayor a cero.';
      return;
    }

    this.revisandoStock = true;
    this.productoService.listarProductosActivos().subscribe({
      next: data => {
        this.revisandoStock = false;
        const productosActuales = new Map(data.filter(p => p.id !== null).map(p => [p.id, p]));
        const noEncontrados = this.carrito.filter(item => !productosActuales.has(item.producto.id));
        if (noEncontrados.length > 0) {
          this.mensajeError = 'Uno o más productos ya no están activos o disponibles en el catálogo. Revisa el carrito.';
          this.productos = data;
          return;
        }

        let preciosActualizados = false;
        // Se actualiza el catálogo y el carrito con datos recientes antes de confirmar.
        this.productos = data;
        for (const item of this.carrito) {
          const productoActual = productosActuales.get(item.producto.id)!;
          if (item.producto.precio !== productoActual.precio) preciosActualizados = true;
          item.producto = productoActual;
        }

        if (preciosActualizados) {
          this.mensajeError = 'Se actualizaron precios de productos. Revisa los nuevos totales y pulsa Procesar venta de nuevo.';
          return;
        }

        this.faltantesConfirmacion = this.faltantesEstimados.map(f => ({ ...f }));
        if (this.faltantesConfirmacion.length > 0) {
          this.aceptaFaltantes = false;
          this.confirmacionAbierta = true;
        } else {
          this.enviarVenta();
        }
      },
      error: e => {
        this.revisandoStock = false;
        this.mensajeError = 'No se pudo verificar el stock actual. Intenta nuevamente.';
        console.error('Error al verificar stock antes de vender:', e);
      }
    });
  }

  cancelarConfirmacion() {
    if (this.procesandoVenta) return;
    this.confirmacionAbierta = false;
    this.aceptaFaltantes = false;
  }

  confirmarVentaConFaltantes() {
    if (!this.aceptaFaltantes || !this.confirmacionAbierta || this.procesandoVenta) return;
    this.enviarVenta();
  }

  private enviarVenta() {
    if (!this.carritoValido || this.procesandoVenta) return;
    const faltantesPrevios = this.faltantesConfirmacion.map(f => ({ ...f }));
    const request: VentaRequest = {
      idCliente: this.idClienteSeleccionado,
      observacion: this.observacion?.trim() || null,
      detalles: this.carrito.map(item => ({
        idProducto: item.producto.id!,
        cantidad: item.cantidad,
      }))
    };

    this.procesandoVenta = true;
    this.ventaService.registrarVenta(request).subscribe({
      next: response => {
        this.procesandoVenta = false;
        this.confirmacionAbierta = false;
        this.aceptaFaltantes = false;
        this.limpiarVenta();
        this.mensajeExito = response.mensaje || 'Venta registrada correctamente.';
        if (faltantesPrevios.length) {
          const unidades = faltantesPrevios.reduce((n, f) => n + f.faltante, 0);
          this.avisoExito = `Antes de registrar se estimaron ${unidades} unidad(es) sin cobertura de stock. `
            + 'El faltante definitivo se calcula y guarda en el backend; la respuesta actual no informa esa cifra.';
        }
      },
      error: error => {
        this.procesandoVenta = false;
        this.mensajeError = 'No se pudo registrar la venta. Comprueba el resultado antes de reintentar.';
        console.error('Error al procesar la venta:', error);
        // Conserva el carrito para evitar perder lo seleccionado tras un error.
      }
    });
  }

  limpiarVenta() {
    this.carrito = [];
    this.codigoBuscado = '';
    this.idClienteSeleccionado = null;
    this.observacion = null;
    this.ingresoCliente = 0;
    this.faltantesConfirmacion = [];
    this.listarProductos();
  }

  actualizarCantidad(item: ItemCarrito, valor: unknown) {
    // Nunca redondeamos cantidades sin consentimiento: se validan antes del POST.
    if (valor === '' || valor === null || valor === undefined) return;
    const cantidad = Number(valor);
    if (Number.isSafeInteger(cantidad) && cantidad > 0) {
      item.cantidad = cantidad;
    }
  }

  buscarPorCodigo() {
    if (!this.codigoBuscado.trim()) return;
    const encontrado = this.productos.find(p => p.codigoBarras === this.codigoBuscado.trim());
    if (encontrado) {
      this.agregarAlCarrito(encontrado);
      this.codigoBuscado = ''; // limpiar
    } else {
      this.mensajeError = 'Producto no encontrado por código de barras.';
    }
  }

  get cambio(): number {
    if (this.ingresoCliente <= 0) return 0;
    return Math.max(0, this.ingresoCliente - this.totalGeneral);
  }
}
