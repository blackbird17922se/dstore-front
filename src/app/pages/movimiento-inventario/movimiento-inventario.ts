import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of, Subject, switchMap } from 'rxjs';

import { MovimientoInventarioResponse } from '../../models/movimiento-inventario.model';
import {
  CampoOrdenMovimiento, MovimientoInventarioBusquedaParams,
  TipoMovimiento, TipoOrigenMovimiento,
} from '../../models/movimiento-inventario-busqueda-params.model';
import { PageResponse } from '../../models/common/page-response.model';
import { ProductoModel } from '../../models/producto/producto.model';
import { MovimientoInventarioService } from '../../services/movimiento-inventario.service';
import { ProductoService } from '../../services/producto.service';

/** @author mau */
@Component({
  selector: 'app-movimiento-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './movimiento-inventario.html',
  styleUrl: './movimiento-inventario.scss',
})
export class MovimientoInventario implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  // false cancela cualquier consulta pendiente cuando el usuario cambia los filtros.
  private readonly recarga$ = new Subject<boolean>();
  private readonly hoy = new Date();

  // Los movimientos son históricos: no consultar automáticamente toda la tabla.
  // El usuario decide cuándo consultar; se precargan los últimos 30 días.
  movimientosResponse: MovimientoInventarioResponse[] = [];
  productos: ProductoModel[] = [];
  textoBusqueda = '';
  idProductoSeleccionado: number | null = null;
  idExistenciaFiltro: number | null = null;
  tipoSeleccionado: TipoMovimiento = '';
  tipoOrigenSeleccionado: TipoOrigenMovimiento = '';
  fechaDesde = this.formatearFecha(new Date(
    this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate() - 29));
  fechaHasta = this.formatearFecha(this.hoy);
  mostrarFiltrosAvanzados = false;

  ordenarPor: CampoOrdenMovimiento = 'fechaMovimiento';
  direccion: 'asc' | 'desc' = 'desc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  consultaRealizada = false;
  errorListado = '';

  movimientoSeleccionado: MovimientoInventarioResponse | null = null;

  constructor(
    private movimientosService: MovimientoInventarioService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    // No usar startWith: solo el botón Consultar inicia la búsqueda general.
    this.recarga$.pipe(
      switchMap(consultar => {
        if (!consultar) {
          // Cancela una petición anterior si los filtros cambian antes de terminar.
          this.cargando = false;
          return of(this.respuestaVacia());
        }

        this.cargando = true;
        this.errorListado = '';

        const filtros: MovimientoInventarioBusquedaParams = {
          texto: this.textoBusqueda.trim(),
          idProducto: this.idProductoSeleccionado,
          idExistencia: this.idExistenciaFiltro,
          tipo: this.tipoSeleccionado,
          tipoOrigen: this.tipoOrigenSeleccionado,
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        };

        return this.movimientosService.listarPaginados(filtros).pipe(
          catchError(error => {
            console.error('Error al consultar movimientos de inventario:', error);
            this.errorListado = 'No fue posible consultar los movimientos. Intenta nuevamente.';
            return of(this.respuestaVacia());
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (this.consultaRealizada && !this.errorListado
          && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.listar();
        return;
      }
      this.movimientosResponse = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    this.listarProductos();
  }

  get fechasValidas(): boolean {
    return !!this.fechaDesde && !!this.fechaHasta && this.fechaDesde <= this.fechaHasta;
  }
  get mensajeFechas(): string {
    if (!this.fechaDesde || !this.fechaHasta) return 'Selecciona ambas fechas para consultar.';
    if (this.fechaDesde > this.fechaHasta) return 'La fecha inicial no puede superar la fecha final.';
    return '';
  }
  get paginaVisible(): number { return this.totalPaginas ? this.pagina + 1 : 0; }
  get registroDesde(): number { return this.totalElementos ? this.pagina * this.tamano + 1 : 0; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }
  get filtrosAvanzadosActivos(): number {
    return Number(this.idProductoSeleccionado !== null)
      + Number(this.idExistenciaFiltro !== null)
      + Number(!!this.tipoOrigenSeleccionado);
  }
  get hayFiltrosOpcionales(): boolean {
    return !!this.textoBusqueda.trim() || !!this.tipoSeleccionado || this.filtrosAvanzadosActivos > 0;
  }

  /** Cambiar filtros solo prepara la próxima consulta; nunca dispara una búsqueda. */
  aplicarFiltros(): void {
    this.pagina = 0;
    this.consultaRealizada = false;
    this.errorListado = '';
    this.recarga$.next(false);
  }
  alCambiarBusqueda(): void { this.aplicarFiltros(); }
  cambiarProducto(): void { this.aplicarFiltros(); }

  /** Única acción que inicia una nueva búsqueda con filtros ingresados por el usuario. */
  consultarMovimientos(): void {
    if (!this.fechasValidas) {
      this.aplicarFiltros();
      this.errorListado = this.mensajeFechas;
      return;
    }
    this.pagina = 0;
    this.consultaRealizada = true;
    this.listar();
  }

  // Paginación y ordenamiento se permiten después de la consulta explícita.
  listar(): void {
    if (this.consultaRealizada && this.fechasValidas) this.recarga$.next(true);
  }
  cambiarTamano(tamano: number): void {
    this.tamano = Number(tamano);
    this.pagina = 0;
    this.listar();
  }
  irPagina(pagina: number): void {
    if (!this.consultaRealizada || pagina < 0 || pagina >= this.totalPaginas
        || pagina === this.pagina) return;
    this.pagina = pagina;
    this.listar();
  }
  ordenar(campo: CampoOrdenMovimiento): void {
    if (!this.consultaRealizada) return;
    if (this.ordenarPor === campo) this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    else { this.ordenarPor = campo; this.direccion = 'asc'; }
    this.pagina = 0;
    this.listar();
  }
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.idProductoSeleccionado = null;
    this.idExistenciaFiltro = null;
    this.tipoSeleccionado = '';
    this.tipoOrigenSeleccionado = '';
    const hoy = new Date();
    this.fechaDesde = this.formatearFecha(new Date(
      hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 29));
    this.fechaHasta = this.formatearFecha(hoy);
    this.ordenarPor = 'fechaMovimiento';
    this.direccion = 'desc';
    this.aplicarFiltros();
  }

  // Se usa hora local para evitar el desfase de un día de toISOString() en Colombia.
  private formatearFecha(fecha: Date): string {
    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  listarProductos(): void {
    // Historial: incluye productos inactivos porque sus movimientos también son históricos.
    this.productoService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.productos = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        error: error => console.error('No se pudo cargar el filtro de productos:', error),
      });
  }

  mostrarOrigen(movimiento: MovimientoInventarioResponse): string {
    if (!movimiento.tipoOrigen || movimiento.idOrigen == null) return 'Sin referencia';
    switch (movimiento.tipoOrigen) {
      case 'ENTRADA_INVENTARIO': return `Entrada #${movimiento.idOrigen}`;
      case 'AJUSTE_INVENTARIO': return `Ajuste #${movimiento.idOrigen}`;
      case 'VENTA': return `Venta #${movimiento.idOrigen}`;
      default: return `${movimiento.tipoOrigen} #${movimiento.idOrigen}`;
    }
  }

  mostrarTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada';
      case 'VENTA': return 'Venta';
      case 'AJUSTE_ENTRADA': return 'Ajuste entrada';
      case 'AJUSTE_SALIDA': return 'Ajuste salida';
      default: return tipo;
    }
  }

  claseTipo(tipo: string): string {
    if (tipo === 'ENTRADA' || tipo === 'AJUSTE_ENTRADA') return 'movimiento-tipo--entrada';
    if (tipo === 'VENTA' || tipo === 'AJUSTE_SALIDA') return 'movimiento-tipo--salida';
    return '';
  }

  verDetalle(movimiento: MovimientoInventarioResponse): void { this.movimientoSeleccionado = movimiento; }
  cerrarDetalle(): void { this.movimientoSeleccionado = null; }

  private respuestaVacia(): PageResponse<MovimientoInventarioResponse> {
    return { content: [], totalElements: 0, totalPages: 0, page: this.pagina, size: this.tamano };
  }
}
