import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';
import { PresentacionModel } from '../../models/presentacion.model';
import { PageResponse } from '../../models/common/page-response.model';
import { PresentacionService } from '../../services/presentacion.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-presentacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion.html',
  styleUrls: ['./presentacion.scss'],
})
export class Presentacion implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  presentaciones: PresentacionModel[] = [];
  nombreBusqueda = '';
  estadoSeleccionado: '' | 'true' | 'false' = '';
  direccion: 'asc' | 'desc' = 'asc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  errorListado = '';

  modalAbierto = false;
  editando = false;
  errorModal = '';
  presentacionActual: PresentacionModel = { id: null, nombre: '', activo: true };

  constructor(private presentacionService: PresentacionService) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        return this.presentacionService.getPaginados({
          nombre: this.nombreBusqueda.trim(),
          activo: this.estadoSeleccionado === '' ? null : this.estadoSeleccionado === 'true',
          page: this.pagina,
          size: this.tamano,
          ordenarPor: 'nombre',
          direccion: this.direccion,
        }).pipe(catchError(error => {
          console.error('Error al consultar presentaciones:', error);
          this.errorListado = 'No fue posible cargar las presentaciones.';
          return of({ content: [], totalElements: 0, totalPages: 0,
            page: this.pagina, size: this.tamano } as PageResponse<PresentacionModel>);
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (!this.errorListado && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.recarga$.next();
        return;
      }
      this.presentaciones = respuesta.content;
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    this.busqueda$.pipe(
      debounceTime(350), distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.aplicarFiltros());
  }

  get hayFiltros(): boolean { return !!this.nombreBusqueda.trim() || this.estadoSeleccionado !== ''; }
  get paginaVisible(): number { return this.totalPaginas === 0 ? 0 : this.pagina + 1; }
  get registroDesde(): number { return this.totalElementos === 0 ? 0 : this.pagina * this.tamano + 1; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }

  alCambiarBusqueda(): void { this.busqueda$.next(this.nombreBusqueda); }
  aplicarFiltros(): void { this.pagina = 0; this.getPresentaciones(); }
  limpiarFiltros(): void {
    this.nombreBusqueda = '';
    this.estadoSeleccionado = '';
    this.aplicarFiltros();
  }
  ordenarNombre(): void {
    this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    this.pagina = 0;
    this.getPresentaciones();
  }
  cambiarTamano(size: number): void {
    this.tamano = Number(size);
    this.pagina = 0;
    this.getPresentaciones();
  }
  irPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas || page === this.pagina) return;
    this.pagina = page;
    this.getPresentaciones();
  }
  getPresentaciones(): void { this.recarga$.next(); }

  abrirModal(): void {
    this.editando = false;
    this.errorModal = '';
    this.resetPresentacionActual();
    this.modalAbierto = true;
  }
  cerrarModal(): void { this.modalAbierto = false; }
  editarPresentacion(presentacion: PresentacionModel): void {
    this.editando = true;
    this.errorModal = '';
    this.presentacionActual = { ...presentacion };
    this.modalAbierto = true;
  }
  guardarPresentacion(): void {
    this.errorModal = '';
    const accion = this.editando
      ? this.presentacionService.update(this.presentacionActual)
      : this.presentacionService.create(this.presentacionActual);
    accion.subscribe({
      next: () => { this.cerrarModal(); this.getPresentaciones(); },
      error: error => {
        this.errorModal = error?.error?.mensaje || 'No fue posible guardar la presentación.';
        console.error('Error al guardar presentación:', error);
      }
    });
  }
  async cambiarEstadoPresentacion(presentacion: PresentacionModel): Promise<void> {
    if (presentacion.id === null) return;

    const nuevoEstado = !presentacion.activo;
    const verbo = nuevoEstado ? 'Activar' : 'Desactivar';

    const confirmado = await this.confirmDialog.confirmar({
      titulo: `${verbo} presentación`,
      mensaje: `¿Deseas ${verbo.toLowerCase()} la presentación «${presentacion.nombre}»?`,
      detalle: nuevoEstado
        ? 'La presentación volverá a estar disponible para nuevas selecciones.'
        : 'La presentación dejará de estar disponible para nuevas selecciones.',
      textoConfirmar: verbo,
      variante: nuevoEstado ? 'primary' : 'danger',
    });

    if (!confirmado) return;

    this.presentacionService.cambiarEstado(presentacion.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.getPresentaciones(),
        error: error => console.error('Error al cambiar estado:', error)
      });
  }
  resetPresentacionActual(): void {
    this.presentacionActual = { id: null, nombre: '', activo: true };
  }
}
