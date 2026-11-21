import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, startWith, Subject, switchMap } from 'rxjs';

import { ExistenciaProductoResponse } from '../../models/existencia-producto-response.model';
import { PageResponse } from '../../models/common/page-response.model';
import { AjusteInventarioRequest, AjusteInventarioResponse, TipoAjusteInventario } from '../../models/inventario/ajuste-inventario.model';
import { AjusteBusquedaParams, CampoOrdenAjuste } from '../../models/inventario/ajuste-inventario-busqueda-params.model';
import { AjusteInventarioService } from '../../services/ajuste-inventario.service';

/** Ajustes de stock por existencia/lote. Operación sensible: confirmar antes de POST. */
@Component({
  selector: 'app-ajuste-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ajuste-inventario.html',
  styleUrl: './ajuste-inventario.scss',
})
export class AjusteInventario implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();
  private readonly busquedaLotes$ = new Subject<string>();

  ajustes: AjusteInventarioResponse[] = [];
  detalleSeleccionado: AjusteInventarioResponse | null = null;
  cargandoDetalle = false;
  mostrarDetalle = false;
  errorDetalle = '';

  textoBusqueda = '';
  tipoFiltro: TipoAjusteInventario | '' = '';
  fechaDesde = this.fechaLocal(-29);
  fechaHasta = this.fechaLocal(0);
  idExistenciaFiltro: number | null = null;
  idProductoFiltro: number | null = null;
  mostrarFiltrosAvanzados = false;

  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  ordenarPor: CampoOrdenAjuste = 'fechaAjuste';
  direccion: 'asc' | 'desc' = 'desc';
  cargando = false;
  errorListado = '';
  mensajeExito = '';

  modalAbierto = false;
  confirmarAbierto = false;
  registrando = false;
  validandoConfirmacion = false;
  errorRegistro = '';
  formulario = this.nuevoFormulario();
  textoBuscarLote = '';
  lotes: ExistenciaProductoResponse[] = [];
  cargandoLotes = false;
  errorLotes = '';
  lotesEncontrados = 0;
  existenciaConfirmada: ExistenciaProductoResponse | null = null;

  constructor(private readonly ajustesService: AjusteInventarioService) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        if (!this.fechasValidas) {
          this.errorListado = 'La fecha inicial no puede superar la fecha final.';
          return of(this.respuestaVacia());
        }
        const filtros: AjusteBusquedaParams = {
          texto: this.textoBusqueda.trim(),
          tipo: this.tipoFiltro,
          idProducto: this.idProductoFiltro,
          idExistencia: this.idExistenciaFiltro,
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        };
        return this.ajustesService.listarPaginados(filtros).pipe(
          catchError(error => {
            console.error('Error al consultar ajustes paginados:', error);
            this.errorListado = 'No fue posible consultar los ajustes. Verifica el endpoint /paginados.';
            return of(this.respuestaVacia());
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (!this.errorListado && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.listar();
        return;
      }
      this.ajustes = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    this.busqueda$.pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.aplicarFiltros());

    this.busquedaLotes$.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscarLotes());
  }

  get fechasValidas(): boolean { return !this.fechaDesde || !this.fechaHasta || this.fechaDesde <= this.fechaHasta; }
  get paginaVisible(): number { return this.totalPaginas ? this.pagina + 1 : 0; }
  get registroDesde(): number { return this.totalElementos ? this.pagina * this.tamano + 1 : 0; }
  get registroHasta(): number { return Math.min(this.totalElementos, (this.pagina + 1) * this.tamano); }
  get filtrosAvanzadosActivos(): number { return Number(this.idExistenciaFiltro !== null) + Number(this.idProductoFiltro !== null); }
  get hayFiltros(): boolean { return !!this.textoBusqueda.trim() || !!this.tipoFiltro || !!this.idExistenciaFiltro || !!this.idProductoFiltro; }

  listar(): void { this.recarga$.next(); }
  alCambiarBusqueda(): void { this.busqueda$.next(this.textoBusqueda); }
  aplicarFiltros(): void { this.pagina = 0; this.listar(); }
  limpiarFiltros(): void {
    this.textoBusqueda = ''; this.tipoFiltro = '';
    this.idExistenciaFiltro = null; this.idProductoFiltro = null;
    this.fechaDesde = this.fechaLocal(-29); this.fechaHasta = this.fechaLocal(0);
    this.aplicarFiltros();
  }
  cambiarTamano(valor: number): void { this.tamano = Number(valor); this.aplicarFiltros(); }
  irPagina(valor: number): void {
    if (valor < 0 || valor >= this.totalPaginas || valor === this.pagina) return;
    this.pagina = valor; this.listar();
  }
  ordenar(campo: CampoOrdenAjuste): void {
    if (this.ordenarPor === campo) this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    else { this.ordenarPor = campo; this.direccion = 'asc'; }
    this.aplicarFiltros();
  }

  abrirModal(): void {
    this.formulario = this.nuevoFormulario();
    this.mensajeExito = '';
    this.modalAbierto = true;
    this.confirmarAbierto = false;
    this.errorRegistro = '';
    this.textoBuscarLote = '';
    this.lotes = [];
    this.existenciaConfirmada = null;
    this.buscarLotes();
  }
  cerrarModal(): void {
    if (this.registrando || this.validandoConfirmacion) return;
    this.modalAbierto = false;
    this.confirmarAbierto = false;
  }
  cambiarTipo(): void {
    this.formulario.idExistencia = null;
    this.existenciaConfirmada = null;
    this.errorRegistro = '';
    this.buscarLotes();
  }
  alBuscarLotes(): void {
    this.formulario.idExistencia = null;
    this.existenciaConfirmada = null;
    this.busquedaLotes$.next(this.textoBuscarLote);
  }
  buscarLotes(): void {
    this.cargandoLotes = true;
    this.errorLotes = '';
    this.ajustesService.buscarExistencias(this.textoBuscarLote, this.formulario.tipo === 'SALIDA')
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargandoLotes = false))
      .subscribe({
        next: pagina => {
          this.lotes = pagina.content;
          this.lotesEncontrados = pagina.totalElements;
          if (this.formulario.idExistencia !== null && !this.lotes.some(x => x.id === this.formulario.idExistencia)) {
            this.formulario.idExistencia = null;
          }
        },
        error: error => {
          console.error('Error al buscar existencias:', error);
          this.lotes = []; this.lotesEncontrados = 0;
          this.errorLotes = 'No fue posible consultar los lotes.';
        },
      });
  }
  get loteSeleccionado(): ExistenciaProductoResponse | null {
    return this.lotes.find(x => x.id === this.formulario.idExistencia) ?? null;
  }
  get cantidadValida(): boolean {
    const cantidad = this.formulario.cantidad;
    return typeof cantidad === 'number' && Number.isSafeInteger(cantidad) && cantidad > 0;
  }
  get formularioValido(): boolean {
    return this.formulario.idExistencia !== null && this.cantidadValida
      && !!this.formulario.motivo.trim() && this.formulario.motivo.trim().length <= 150
      && (this.formulario.observacion?.length ?? 0) <= 500
      && (this.formulario.tipo === 'ENTRADA' || this.formulario.tipo === 'SALIDA')
      && !!this.loteSeleccionado;
  }
  get stockResultante(): number | null {
    if (!this.existenciaConfirmada || !this.cantidadValida) return null;
    const signo = this.formulario.tipo === 'ENTRADA' ? 1 : -1;
    const resultado = this.existenciaConfirmada.cantidad + signo * this.formulario.cantidad;
    return Number.isSafeInteger(resultado) && resultado >= 0 ? resultado : null;
  }
  prepararConfirmacion(): void {
    this.errorRegistro = '';
    if (!this.formularioValido || this.formulario.idExistencia === null) {
      this.errorRegistro = 'Selecciona un lote y completa la cantidad y el motivo.';
      return;
    }
    this.validandoConfirmacion = true;
    // El stock se vuelve a consultar justo antes de mostrar la confirmación.
    this.ajustesService.consultarExistencia(this.formulario.idExistencia)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.validandoConfirmacion = false))
      .subscribe({
        next: existencia => {
          this.existenciaConfirmada = existencia;
          if (this.stockResultante === null) {
            this.errorRegistro = 'El stock actual no permite ese ajuste. Revisa la cantidad.';
            return;
          }
          this.confirmarAbierto = true;
        },
        error: error => {
          console.error('Error al validar existencia:', error);
          this.errorRegistro = 'No se pudo comprobar el stock. No se registró ningún ajuste.';
        },
      });
  }
  volverFormulario(): void { if (!this.registrando) this.confirmarAbierto = false; }
  confirmarAjuste(): void {
    if (!this.confirmarAbierto || this.registrando || !this.formularioValido || this.stockResultante === null || this.formulario.idExistencia === null) return;
    const tipo = this.formulario.tipo;
    if (tipo !== 'ENTRADA' && tipo !== 'SALIDA') return;
    const request: AjusteInventarioRequest = {
      idExistencia: this.formulario.idExistencia,
      tipo,
      cantidad: this.formulario.cantidad,
      motivo: this.formulario.motivo.trim(),
      observacion: this.formulario.observacion?.trim() || null,
    };
    this.registrando = true;
    this.errorRegistro = '';
    this.ajustesService.registrar(request)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.registrando = false))
      .subscribe({
        next: ajuste => {
          this.modalAbierto = false;
          this.confirmarAbierto = false;
          this.mensajeExito = `Ajuste #${ajuste.id} registrado correctamente.`;
          this.aplicarFiltros();
        },
        error: error => {
          console.error('Error al registrar ajuste:', error);
          // No se da por registrado si el servidor lo rechaza, incluso cuando la vista previa parecía válida.
          const msg = error?.error?.message;
          this.errorRegistro = typeof msg === 'string' && msg.length < 240
            ? msg : 'El ajuste fue rechazado. Comprueba el stock y vuelve a consultar la existencia.';
          this.confirmarAbierto = false;
          this.existenciaConfirmada = null;
          this.buscarLotes();
        },
      });
  }

  verDetalle(id: number): void {
    this.detalleSeleccionado = null;
    this.errorDetalle = '';
    this.mostrarDetalle = true;
    this.cargandoDetalle = true;
    this.ajustesService.obtenerPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargandoDetalle = false))
      .subscribe({
        next: ajuste => this.detalleSeleccionado = ajuste,
        error: error => { console.error(error); this.errorDetalle = 'No fue posible cargar el detalle.'; },
      });
  }
  cerrarDetalle(): void { this.mostrarDetalle = false; this.detalleSeleccionado = null; }
  signo(ajuste: AjusteInventarioResponse): string { return ajuste.tipo === 'ENTRADA' ? '+' : '-'; }
  private nuevoFormulario(): { idExistencia: number | null; tipo: TipoAjusteInventario | ''; cantidad: number; motivo: string; observacion: string } {
    return { idExistencia: null, tipo: '', cantidad: 1, motivo: '', observacion: '' };
  }
  private respuestaVacia(): PageResponse<AjusteInventarioResponse> {
    return { content: [], totalElements: 0, totalPages: 0, page: this.pagina, size: this.tamano };
  }
  private fechaLocal(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
