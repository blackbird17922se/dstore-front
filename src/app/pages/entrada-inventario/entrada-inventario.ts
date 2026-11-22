import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, startWith, Subject, switchMap } from 'rxjs';

import { EntradaInventarioRequest } from '../../models/inventario/entrada-inventario-request.model';
import { EntradaInventarioResponse } from '../../models/inventario/entrada-inventario-response.model';
import { EntradaInventarioListado } from '../../models/inventario/entrada-inventario-listado.model';
import { CampoOrdenEntrada, EntradaInventarioBusquedaParams } from '../../models/inventario/entrada-inventario-busqueda-params.model';
import { PageResponse } from '../../models/common/page-response.model';
import { EntradaInventarioService } from '../../services/entrada-inventario.service';
import { ProductoService } from '../../services/producto.service';
import { ProductoModel } from '../../models/producto/producto.model';

/** @author Mauricio A */
@Component({
  selector: 'app-entrada-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada-inventario.html',
  styleUrl: './entrada-inventario.scss',
})
export class EntradaInventario implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();
  private readonly formatoFechaColombia = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  productos: ProductoModel[] = [];
  entradas: EntradaInventarioListado[] = [];
  entradaSeleccionada: EntradaInventarioResponse | null = null;

  // Listado: filtros y paginación aplicados en Spring Boot.
  textoBusqueda = '';
  numeroDocumentoFiltro = '';
  fechaEntradaDesde = '';
  fechaEntradaHasta = '';
  fechaRegistroDesde = '';
  fechaRegistroHasta = '';
  mostrarFiltrosAvanzados = false;
  ordenarPor: CampoOrdenEntrada = 'fechaRegistro';
  direccion: 'asc' | 'desc' = 'desc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  errorListado = '';
  mensajeExito = '';

  // Registro de una entrada con uno o varios productos; no editamos entradas históricas.
  modalAbierto = false;
  registrando = false;
  errorRegistro = '';
  entradaInventarioRequest: EntradaInventarioRequest = this.crearEntradaVacia();

  // El listado trae cabeceras; los detalles se consultan solo a petición.
  modalDetalleAbierto = false;
  detalleCargando = false;
  errorDetalle = '';

  constructor(
    private entradaInventarioService: EntradaInventarioService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        if (!this.filtrosValidos) {
          this.errorListado = 'La fecha inicial no puede superar la fecha final.';
          return of(this.respuestaVacia());
        }
        const filtros: EntradaInventarioBusquedaParams = {
          texto: this.textoBusqueda.trim(),
          numeroDocumento: this.numeroDocumentoFiltro.trim(),
          fechaEntradaDesde: this.fechaEntradaDesde,
          fechaEntradaHasta: this.fechaEntradaHasta,
          fechaRegistroDesde: this.fechaRegistroDesde,
          fechaRegistroHasta: this.fechaRegistroHasta,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        };
        return this.entradaInventarioService.listarPaginadas(filtros).pipe(
          catchError(error => {
            console.error('Error al consultar entradas paginadas:', error);
            this.errorListado = 'No fue posible cargar las entradas. Intenta nuevamente.';
            return of(this.respuestaVacia());
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (!this.errorListado && this.pagina > 0 && respuesta.totalPages > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = respuesta.totalPages - 1;
        this.listar();
        return;
      }
      this.entradas = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.aplicarFiltros());

    this.listarProductosActivos();
  }

  get fechaHoy(): string { return this.fechaActual(); }
  get paginaVisible(): number { return this.totalPaginas ? this.pagina + 1 : 0; }
  get registroDesde(): number { return this.totalElementos ? this.pagina * this.tamano + 1 : 0; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }
  get filtrosValidos(): boolean {
    const rango = (desde: string, hasta: string) => !desde || !hasta || desde <= hasta;
    return rango(this.fechaEntradaDesde, this.fechaEntradaHasta)
      && rango(this.fechaRegistroDesde, this.fechaRegistroHasta);
  }
  get filtrosAvanzadosActivos(): number {
    return Number(!!this.numeroDocumentoFiltro.trim())
      + Number(!!this.fechaRegistroDesde)
      + Number(!!this.fechaRegistroHasta);
  }
  get hayFiltros(): boolean {
    return !!this.textoBusqueda.trim() || !!this.fechaEntradaDesde || !!this.fechaEntradaHasta
      || this.filtrosAvanzadosActivos > 0;
  }
  get totalUnidadesDetalle(): number {
    return this.entradaSeleccionada?.detalles.reduce((acumulado, detalle) => acumulado + detalle.cantidad, 0) ?? 0;
  }

  listar(): void { this.recarga$.next(); }
  alCambiarBusqueda(): void { this.busqueda$.next(`${this.textoBusqueda}|${this.numeroDocumentoFiltro}`); }
  aplicarFiltros(): void { this.pagina = 0; this.listar(); }
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.numeroDocumentoFiltro = '';
    this.fechaEntradaDesde = '';
    this.fechaEntradaHasta = '';
    this.fechaRegistroDesde = '';
    this.fechaRegistroHasta = '';
    this.aplicarFiltros();
  }
  ordenar(campo: CampoOrdenEntrada): void {
    if (this.ordenarPor === campo) this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    else { this.ordenarPor = campo; this.direccion = 'asc'; }
    this.aplicarFiltros();
  }
  cambiarTamano(nuevoTamano: number): void {
    this.tamano = Number(nuevoTamano);
    this.aplicarFiltros();
  }
  irPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.pagina) return;
    this.pagina = pagina;
    this.listar();
  }

  listarProductosActivos(): void {
    this.productoService.listarProductosActivos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.productos = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        error: error => console.error('Error al obtener productos activos:', error),
      });
  }

  abrirModal(): void {
    this.resetEntradaInventario();
    this.agregarDetalle();
    this.errorRegistro = '';
    this.mensajeExito = '';
    this.modalAbierto = true;
  }
  cerrarModal(): void {
    if (this.registrando) return;
    this.modalAbierto = false;
  }
  agregarDetalle(): void {
    this.entradaInventarioRequest.detalles.push({
      idProducto: 0, cantidad: 1, numeroLote: null, fechaVencimiento: null,
    });
  }
  eliminarDetalle(indice: number): void {
    this.entradaInventarioRequest.detalles.splice(indice, 1);
  }
  productoControlaVencimiento(idProducto: number): boolean {
    const producto = this.productos.find(producto => producto.id === idProducto);
    return producto?.controlaVencimiento ?? false;
  }
  productoSeleccionadoNombre(idProducto: number): string {
    return this.productos.find(producto => producto.id === idProducto)?.nombre ?? 'Sin seleccionar';
  }

  registrarEntrada(formEntrada: NgForm): void {
    if (this.registrando || formEntrada.invalid || !this.formularioValido) return;
    this.registrando = true;
    this.errorRegistro = '';

    const request: EntradaInventarioRequest = {
      fechaEntrada: this.entradaInventarioRequest.fechaEntrada,
      numeroDocumento: this.entradaInventarioRequest.numeroDocumento?.trim() || null,
      observacion: this.entradaInventarioRequest.observacion?.trim() || null,
      detalles: this.entradaInventarioRequest.detalles.map(detalle => ({
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidad,
        numeroLote: detalle.numeroLote?.trim() || null,
        fechaVencimiento: detalle.fechaVencimiento || null,
      })),
    };

    this.entradaInventarioService.registrarEntrada(request).pipe(
      finalize(() => this.registrando = false),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: respuesta => {
        this.modalAbierto = false;
        this.mensajeExito = `Entrada #${respuesta.id} registrada correctamente.`;
        this.pagina = 0;
        this.listar();
      },
      error: error => {
        console.error('Error al registrar entrada en el inventario:', error);
        this.errorRegistro = typeof error?.error?.message === 'string'
          ? error.error.message
          : 'No fue posible registrar la entrada. Revisa los datos e intenta nuevamente.';
      },
    });
  }

  get formularioValido(): boolean {
    const datos = this.entradaInventarioRequest;
    if (!datos.fechaEntrada || datos.fechaEntrada > this.fechaHoy || datos.detalles.length === 0) return false;
    return datos.detalles.every(detalle =>
      detalle.idProducto > 0 && Number.isInteger(detalle.cantidad) && detalle.cantidad > 0
      && (!detalle.fechaVencimiento || detalle.fechaVencimiento >= this.fechaHoy)
      && (!this.productoControlaVencimiento(detalle.idProducto) || !!detalle.fechaVencimiento)
    );
  }

  verDetalle(entrada: EntradaInventarioListado): void {
    this.entradaSeleccionada = null;
    this.errorDetalle = '';
    this.detalleCargando = true;
    this.modalDetalleAbierto = true;
    this.entradaInventarioService.obtenerPorId(entrada.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (!this.modalDetalleAbierto) return;
          this.entradaSeleccionada = data;
          this.detalleCargando = false;
        },
        error: error => {
          console.error('Error al consultar el detalle de entrada:', error);
          this.errorDetalle = 'No fue posible consultar el detalle de esta entrada.';
          this.detalleCargando = false;
        },
      });
  }
  cerrarDetalle(): void {
    this.modalDetalleAbierto = false;
    this.entradaSeleccionada = null;
  }

  private resetEntradaInventario(): void {
    this.entradaInventarioRequest = this.crearEntradaVacia();
  }
  private crearEntradaVacia(): EntradaInventarioRequest {
    return { fechaEntrada: this.fechaActual(), numeroDocumento: '', observacion: '', detalles: [] };
  }
  private fechaActual(): string {
    // La fecha operativa de DStore es la de Colombia, independientemente
    // de la zona horaria configurada en el dispositivo del usuario.
    const partes = this.formatoFechaColombia.formatToParts(new Date());
    const obtener = (tipo: string): string => partes.find(parte => parte.type === tipo)?.value ?? '';
    return `${obtener('year')}-${obtener('month')}-${obtener('day')}`;
  }
  private respuestaVacia(): PageResponse<EntradaInventarioListado> {
    return { content: [], totalElements: 0, totalPages: 0, page: this.pagina, size: this.tamano };
  }
}
