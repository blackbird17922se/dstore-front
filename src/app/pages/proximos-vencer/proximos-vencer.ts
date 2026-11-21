import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';

import { PageResponse } from '../../models/common/page-response.model';
import { ProductoModel } from '../../models/producto/producto.model';
import { AlertaVencimientoResponse, EstadoVencimiento, ResumenVencimientos } from '../../models/vencimiento-alerta.model';
import { OrdenAlerta, VencimientoBusquedaParams } from '../../models/vencimiento-busqueda-params.model';
import { AlertaVencimientoService } from '../../services/alerta-vencimiento.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-proximos-vencer',
  imports: [CommonModule, FormsModule],
  templateUrl: './proximos-vencer.html',
  styleUrl: './proximos-vencer.scss',
})
export class ProximosVencer implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recargaListado$ = new Subject<void>();
  private readonly recargaResumen$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  /** Solo lotes con stock positivo y vencimiento; los estados vienen calculados en Java. */
  alertas: AlertaVencimientoResponse[] = [];
  resumen: ResumenVencimientos | null = null;
  productos: ProductoModel[] = [];

  textoBusqueda = '';
  idProductoSeleccionado: number | null = null;
  estadoSeleccionado: EstadoVencimiento | '' = '';
  dias = 30;
  vencimientoDesde = '';
  vencimientoHasta = '';
  mostrarFiltrosAvanzados = false;

  ordenarPor: OrdenAlerta = 'fechaVencimiento';
  direccion: 'asc' | 'desc' = 'asc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  cargandoResumen = false;
  errorListado = '';
  errorResumen = '';

  readonly indicadores: { estado: EstadoVencimiento; titulo: string; descripcion: string }[] = [
    { estado: 'VENCIDO', titulo: 'Vencidos', descripcion: 'Fecha ya superada' },
    { estado: 'CRITICO', titulo: 'Críticos', descripcion: '0 a 7 días' },
    { estado: 'PROXIMO', titulo: 'Próximos', descripcion: '8 a 30 días' },
    { estado: 'SEGUIMIENTO', titulo: 'En seguimiento', descripcion: '31 a 60 días' },
    { estado: 'SIN_ALERTA', titulo: 'Sin alerta', descripcion: 'Más de 60 días' },
  ];

  constructor(
    private alertaService: AlertaVencimientoService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    // switchMap cancela peticiones anteriores: no se muestran resultados de filtros antiguos.
    this.recargaListado$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        if (!this.rangoValido) {
          return of(this.respuestaVacia());
        }
        const filtros: VencimientoBusquedaParams = {
          texto: this.textoBusqueda.trim(),
          idProducto: this.idProductoSeleccionado,
          estado: this.estadoSeleccionado,
          dias: this.dias,
          vencimientoDesde: this.vencimientoDesde,
          vencimientoHasta: this.vencimientoHasta,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        };
        return this.alertaService.listarPaginados(filtros).pipe(
          catchError(error => {
            console.error('Error al consultar alertas de vencimiento:', error);
            this.errorListado = 'No fue posible consultar las alertas. Comprueba que el backend V1 esté instalado.';
            return of(this.respuestaVacia());
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (!this.errorListado && this.rangoValido && this.pagina > 0
          && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.listar();
        return;
      }
      this.alertas = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    // Los indicadores son globales: solo cambia su contenido al buscar o elegir producto.
    this.recargaResumen$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargandoResumen = true;
        this.errorResumen = '';
        return this.alertaService.obtenerResumen(this.textoBusqueda, this.idProductoSeleccionado).pipe(
          catchError(error => {
            console.error('Error al obtener el resumen de vencimientos:', error);
            this.errorResumen = 'No fue posible cargar los indicadores.';
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(resumen => {
      this.resumen = resumen;
      this.cargandoResumen = false;
    });

    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.aplicarFiltros(true));

    this.productoService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: productos => this.productos = [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        error: error => console.error('No se pudieron cargar productos para el filtro:', error),
      });
  }

  get paginaVisible(): number { return this.totalPaginas ? this.pagina + 1 : 0; }
  get registroDesde(): number { return this.totalElementos ? this.pagina * this.tamano + 1 : 0; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }
  get rangoValido(): boolean {
    return !this.vencimientoDesde || !this.vencimientoHasta || this.vencimientoDesde <= this.vencimientoHasta;
  }
  get filtrosAvanzadosActivos(): number {
    return Number(this.idProductoSeleccionado !== null) + Number(!!this.vencimientoDesde) + Number(!!this.vencimientoHasta);
  }
  get hayFiltros(): boolean {
    return !!this.textoBusqueda.trim() || this.estadoSeleccionado !== '' || this.dias !== 30
      || this.filtrosAvanzadosActivos > 0;
  }

  /** El rango de días representa vencimientos futuros; los vencidos SIEMPRE se incluyen. */
  cambiarDias(): void {
    if (this.estadoSeleccionado === 'SEGUIMIENTO' && this.dias < 60) this.dias = 60;
    if (this.estadoSeleccionado === 'SIN_ALERTA' && this.dias < 90) this.dias = 90;
    this.aplicarFiltros();
  }

  seleccionarEstado(estado: EstadoVencimiento | ''): void {
    this.estadoSeleccionado = estado;
    if (estado === 'SEGUIMIENTO' && this.dias < 60) this.dias = 60;
    // La tarjeta «Sin alerta» amplía al máximo horizonte permitido por el API (10 años).
    if (estado === 'SIN_ALERTA' && this.dias < 3650) this.dias = 3650;
    this.aplicarFiltros();
  }

  alCambiarBusqueda(): void { this.busqueda$.next(this.textoBusqueda); }
  aplicarFiltros(actualizarResumen = false): void {
    this.pagina = 0;
    this.listar();
    if (actualizarResumen) this.actualizarResumen();
  }
  cambiarProducto(): void { this.aplicarFiltros(true); }
  listar(): void { this.recargaListado$.next(); }
  actualizarResumen(): void { this.recargaResumen$.next(); }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.idProductoSeleccionado = null;
    this.estadoSeleccionado = '';
    this.dias = 30;
    this.vencimientoDesde = '';
    this.vencimientoHasta = '';
    this.ordenarPor = 'fechaVencimiento';
    this.direccion = 'asc';
    this.aplicarFiltros(true);
  }

  cambiarTamano(tamano: number): void {
    this.tamano = Number(tamano);
    this.pagina = 0;
    this.listar();
  }
  irPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.pagina || this.cargando) return;
    this.pagina = pagina;
    this.listar();
  }
  ordenar(campo: OrdenAlerta): void {
    if (this.ordenarPor === campo) this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    else { this.ordenarPor = campo; this.direccion = 'asc'; }
    this.pagina = 0;
    this.listar();
  }

  contadorEstado(estado: EstadoVencimiento): number | null {
    if (!this.resumen) return null;
    switch (estado) {
      case 'VENCIDO': return this.resumen.vencidos;
      case 'CRITICO': return this.resumen.criticos;
      case 'PROXIMO': return this.resumen.proximos;
      case 'SEGUIMIENTO': return this.resumen.seguimiento;
      case 'SIN_ALERTA': return this.resumen.sinAlerta;
    }
  }
  etiquetaEstado(estado: EstadoVencimiento): string {
    return this.indicadores.find(item => item.estado === estado)?.titulo ?? estado;
  }
  leyendaDias(dias: number): string {
    if (dias < 0) return `Venció hace ${Math.abs(dias)} día${dias === -1 ? '' : 's'}`;
    if (dias === 0) return 'Vence hoy';
    return `En ${dias} día${dias === 1 ? '' : 's'}`;
  }

  private respuestaVacia(): PageResponse<AlertaVencimientoResponse> {
    return { content: [], totalElements: 0, totalPages: 0, page: this.pagina, size: this.tamano };
  }
}
