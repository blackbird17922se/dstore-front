import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { VentaService } from '../../services/venta.service';
import { VentaResponse } from '../../models/venta/venta-response.model';
import { VentaBusquedaParams, CampoOrdenVenta } from '../../models/venta/venta-busqueda-params.model';
import { PageResponse } from '../../models/common/page-response.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss',
})
export class Venta implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  ventasResponse: VentaResponse[] = [];
  textoBusqueda = '';
  estadoFiltro = '';
  // Por defecto se consulta el último mes: se puede ampliar o quitar el período.
  fechaDesde = this.fechaLocal(-29);
  fechaHasta = this.fechaLocal(0);
  idClienteFiltro: number | null = null;
  idVendedorFiltro: number | null = null;
  totalMinFiltro: number | null = null;
  totalMaxFiltro: number | null = null;
  mostrarFiltrosAvanzados = false;

  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  ordenarPor: CampoOrdenVenta = 'fecha';
  direccion: 'asc' | 'desc' = 'desc';
  cargando = false;
  errorListado = '';
  mensajeExito = '';

  // Mantener el flujo de anulación existente, ahora con validación y bloqueo del botón.
  mostrarModal = false;
  ventaSeleccionadaId: number | null = null;
  ventaSeleccionada: VentaResponse | null = null;
  motivo = '';
  anulando = false;
  errorAnulacion = '';

  constructor(
    private readonly ventaService: VentaService,
    public readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      switchMap(() => {
        this.errorListado = '';
        if (!this.filtrosValidos) {
          this.cargando = false;
          return of(this.respuestaVacia());
        }
        this.cargando = true;
        const filtros: VentaBusquedaParams = {
          texto: this.textoBusqueda,
          estado: this.estadoFiltro,
          idCliente: this.idClienteFiltro,
          idVendedor: this.idVendedorFiltro,
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          totalMin: this.totalMinFiltro,
          totalMax: this.totalMaxFiltro,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        };
        return this.ventaService.listarVentasPaginadas(filtros).pipe(
          catchError(error => {
            console.error('Error al consultar el historial de ventas:', error);
            this.errorListado = 'No fue posible consultar las ventas. Intenta nuevamente.';
            return of(this.respuestaVacia());
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(respuesta => {
      if (!this.errorListado && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.listarVentas();
        return;
      }
      this.ventasResponse = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.aplicarFiltros());

    this.listarVentas();
  }

  get filtrosValidos(): boolean {
    const fechasBien = (!this.fechaDesde || !this.fechaHasta || this.fechaDesde <= this.fechaHasta);
    const importesBien = [this.totalMinFiltro, this.totalMaxFiltro].every(
      x => x === null || (Number.isFinite(x) && x >= 0)
    );
    return fechasBien && importesBien && (
      this.totalMinFiltro === null || this.totalMaxFiltro === null || this.totalMinFiltro <= this.totalMaxFiltro
    ) && [this.idClienteFiltro, this.idVendedorFiltro].every(
      x => x === null || (Number.isInteger(x) && x > 0)
    );
  }
  get mensajeFiltros(): string {
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      return 'La fecha inicial no puede superar la fecha final.';
    }
    if ([this.totalMinFiltro, this.totalMaxFiltro].some(x => x !== null && (!Number.isFinite(x) || x < 0))) {
      return 'Los importes deben ser números no negativos.';
    }
    if (this.totalMinFiltro !== null && this.totalMaxFiltro !== null
        && this.totalMinFiltro > this.totalMaxFiltro) return 'El total mínimo supera el máximo.';
    if ([this.idClienteFiltro, this.idVendedorFiltro].some(x => x !== null && (!Number.isInteger(x) || x <= 0))) {
      return 'Los identificadores de cliente y vendedor deben ser positivos.';
    }
    return '';
  }
  get filtrosAvanzadosActivos(): number {
    return Number(this.idClienteFiltro !== null) + Number(this.idVendedorFiltro !== null)
      + Number(this.totalMinFiltro !== null) + Number(this.totalMaxFiltro !== null);
  }
  get paginaVisible(): number { return this.totalPaginas ? this.pagina + 1 : 0; }
  get registroDesde(): number { return this.totalElementos ? this.pagina * this.tamano + 1 : 0; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }

  listarVentas(): void { this.recarga$.next(); }
  aplicarFiltros(): void { this.pagina = 0; this.mensajeExito = ''; this.listarVentas(); }
  alCambiarBusqueda(): void { this.busqueda$.next(this.textoBusqueda); }
  cambiarTamano(valor: number): void {
    this.tamano = Number(valor); this.pagina = 0; this.listarVentas();
  }
  irPagina(valor: number): void {
    if (this.cargando || valor === this.pagina || valor < 0 || valor >= this.totalPaginas) return;
    this.pagina = valor; this.listarVentas();
  }
  ordenar(campo: CampoOrdenVenta): void {
    if (this.ordenarPor === campo) this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    else { this.ordenarPor = campo; this.direccion = 'asc'; }
    this.pagina = 0; this.listarVentas();
  }
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.estadoFiltro = '';
    this.fechaDesde = this.fechaLocal(-29);
    this.fechaHasta = this.fechaLocal(0);
    this.idClienteFiltro = null;
    this.idVendedorFiltro = null;
    this.totalMinFiltro = null;
    this.totalMaxFiltro = null;
    this.ordenarPor = 'fecha';
    this.direccion = 'desc';
    this.aplicarFiltros();
  }

  // El antiguo verDetalle() consultaba aquí con subscribe; ahora la ruta dedicada
  // solicita el detalle por ID para no cargar productos en el listado.
  verDetalle(id: number | null): void {
    if (id === null) return;
    // Se conserva la navegación existente al detalle, sin abrir otro modal.
    this.router.navigate(['/detalle-venta', id]);
  }

  abrirModalAnular(venta: VentaResponse): void {
    if (!this.authService.esAdmin() || venta.estado !== 'CONFIRMADA' || this.anulando) return;
    this.ventaSeleccionadaId = venta.id;
    this.ventaSeleccionada = venta;
    this.motivo = '';
    this.errorAnulacion = '';
    this.mostrarModal = true;
  }
  cerrarModal(): void {
    if (this.anulando) return;
    this.mostrarModal = false;
    this.motivo = '';
    this.ventaSeleccionadaId = null;
    this.ventaSeleccionada = null;
    this.errorAnulacion = '';
  }
  confirmarAnulacion(): void {
    if (this.anulando || this.ventaSeleccionadaId === null || !this.motivo.trim()
        || this.motivo.trim().length > 500 || !this.authService.esAdmin()) return;

    this.anulando = true;
    this.errorAnulacion = '';
    this.ventaService.anularVenta(this.ventaSeleccionadaId, this.motivo.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: respuesta => {
          this.anulando = false;
          this.cerrarModal();
          this.mensajeExito = respuesta.mensaje || 'Venta anulada correctamente.';
          this.listarVentas();
        },
        error: error => {
          this.anulando = false;
          console.error('Error al anular venta:', error);
          this.errorAnulacion = error.error?.mensaje || error.error?.message
            || 'No se pudo anular la venta. Comprueba su estado y vuelve a intentar.';
        },
      });
  }

  etiquetaEstado(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA': return 'Confirmada';
      case 'ANULADA': return 'Anulada';
      case 'BORRADOR': return 'Borrador';
      default: return estado;
    }
  }
  claseEstado(estado: string): string {
    if (estado === 'CONFIRMADA') return 'venta-estado--confirmada';
    if (estado === 'ANULADA') return 'venta-estado--anulada';
    return 'venta-estado--otros';
  }

  private fechaLocal(diasDesdeHoy: number): string {
    // Fecha local, sin toISOString(): evita desfases de día en America/Bogota.
    const hoy = new Date();
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + diasDesdeHoy);
    const year = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${mes}-${dia}`;
  }
  private respuestaVacia(): PageResponse<VentaResponse> {
    return { content: [], totalElements: 0, totalPages: 0, page: this.pagina, size: this.tamano };
  }
}
