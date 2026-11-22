import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';

import { ExistenciaProductoResponse } from '../../models/existencia-producto-response.model';
import { CampoOrdenExistencia, ExistenciaBusquedaParams } from '../../models/existencia-busqueda-params.model';
import { PageResponse } from '../../models/common/page-response.model';
import { ExistenciaProductoService } from '../../services/existencia-producto.service';
import { ProductoModel } from '../../models/producto/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-existencias',
  imports: [CommonModule, FormsModule],
  templateUrl: './existencias.html',
  styleUrl: './existencias.scss',
})
export class Existencias implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  existenciasMostradas: ExistenciaProductoResponse[] = [];
  existenciaSeleccionada: ExistenciaProductoResponse | null = null;
  productos: ProductoModel[] = [];
  detallesExpandidos = new Set<number>();

  // El servidor aplica los filtros ANTES de paginar; el cliente no recorta páginas.
  textoBusqueda = '';
  idProductoSeleccionado: number | null = null;
  estadoStock: '' | 'true' | 'false' = '';
  numeroLote = '';
  cantidadMin: number | null = null;
  cantidadMax: number | null = null;
  vencimientoDesde = '';
  vencimientoHasta = '';
  ingresoDesde = '';
  ingresoHasta = '';
  mostrarFiltrosAvanzados = false;

  ordenarPor: CampoOrdenExistencia = 'producto.nombre';
  direccion: 'asc' | 'desc' = 'asc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  errorListado = '';

  constructor(
    private existenciaService: ExistenciaProductoService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    // switchMap descarta las respuestas anteriores cuando cambian rápidamente los filtros.
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';

        if (!this.filtrosValidos) {
          this.errorListado = 'Revisa los rangos: la fecha o cantidad inicial no puede superar la final.';
          return of(this.respuestaVacia());
        }

        const filtros: ExistenciaBusquedaParams = {
          texto: this.textoBusqueda.trim(),
          idProducto: this.idProductoSeleccionado,
          conStock: this.estadoStock === '' ? null : this.estadoStock === 'true',
          numeroLote: this.numeroLote.trim(),
          cantidadMin: this.cantidadMin,
          cantidadMax: this.cantidadMax,
          vencimientoDesde: this.vencimientoDesde,
          vencimientoHasta: this.vencimientoHasta,
          ingresoDesde: this.ingresoDesde,
          ingresoHasta: this.ingresoHasta,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        };

        return this.existenciaService.listarExistenciasPaginadas(filtros).pipe(
          catchError(error => {
            console.error('Error al consultar existencias paginadas:', error);
            this.errorListado = 'No fue posible cargar las existencias. Intenta nuevamente.';
            return of(this.respuestaVacia());
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      // Si al filtrar desaparece la última página, regresamos a la anterior.
      if (!this.errorListado && this.pagina > 0 && respuesta.totalPages > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = respuesta.totalPages - 1;
        this.recarga$.next();
        return;
      }
      this.existenciasMostradas = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.detallesExpandidos.clear();
      this.cargando = false;
    });

    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.aplicarFiltros());

    this.listarProductos();
  }

  get paginaVisible(): number { return this.totalPaginas ? this.pagina + 1 : 0; }
  get registroDesde(): number { return this.totalElementos ? this.pagina * this.tamano + 1 : 0; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }

  get filtrosValidos(): boolean {
    const rangoValido = (desde: string, hasta: string) => !desde || !hasta || desde <= hasta;
    return rangoValido(this.vencimientoDesde, this.vencimientoHasta)
      && rangoValido(this.ingresoDesde, this.ingresoHasta)
      && (this.cantidadMin === null || this.cantidadMin >= 0)
      && (this.cantidadMax === null || this.cantidadMax >= 0)
      && (this.cantidadMin === null || this.cantidadMax === null || this.cantidadMin <= this.cantidadMax);
  }

  get hayFiltros(): boolean {
    return !!this.textoBusqueda.trim() || this.filtrosAvanzadosActivos > 0;
  }

  get filtrosAvanzadosActivos(): number {
    return Number(this.idProductoSeleccionado !== null)
      + Number(this.estadoStock !== '')
      + Number(!!this.numeroLote.trim())
      + Number(this.cantidadMin !== null)
      + Number(this.cantidadMax !== null)
      + Number(!!this.vencimientoDesde)
      + Number(!!this.vencimientoHasta)
      + Number(!!this.ingresoDesde)
      + Number(!!this.ingresoHasta);
  }

  alCambiarBusqueda(): void {
    this.busqueda$.next(`${this.textoBusqueda}|${this.numeroLote}`);
  }

  aplicarFiltros(): void {
    this.pagina = 0;
    this.listarExistencias();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.idProductoSeleccionado = null;
    this.estadoStock = '';
    this.numeroLote = '';
    this.cantidadMin = null;
    this.cantidadMax = null;
    this.vencimientoDesde = '';
    this.vencimientoHasta = '';
    this.ingresoDesde = '';
    this.ingresoHasta = '';
    this.aplicarFiltros();
  }

  ordenar(campo: CampoOrdenExistencia): void {
    if (this.ordenarPor === campo) {
      this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = campo;
      this.direccion = 'asc';
    }
    this.aplicarFiltros();
  }

  cambiarTamano(tamano: number): void {
    this.tamano = Number(tamano);
    this.aplicarFiltros();
  }

  irPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.pagina) return;
    this.pagina = pagina;
    this.listarExistencias();
  }

  listarExistencias(): void { this.recarga$.next(); }

  // Se conserva la consulta individual existente para futuras fichas del lote.
  obtenerExistencia(id: number): void {
    this.existenciaService.obtenerExistencia(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.existenciaSeleccionada = data,
        error: error => console.error('Error al obtener existencia:', error),
      });
  }

  toggleDetalles(id: number): void {
    if (this.detallesExpandidos.has(id)) this.detallesExpandidos.delete(id);
    else this.detallesExpandidos.add(id);
  }
  detalleExpandido(id: number): boolean { return this.detallesExpandidos.has(id); }

  listarProductos(): void {
    // Incluimos los productos inactivos: pueden conservar lotes históricos.
    this.productoService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.productos = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        error: error => console.error('Error al obtener catálogo de productos:', error),
      });
  }

  private respuestaVacia(): PageResponse<ExistenciaProductoResponse> {
    return { content: [], totalElements: 0, totalPages: 0, page: this.pagina, size: this.tamano };
  }
}
