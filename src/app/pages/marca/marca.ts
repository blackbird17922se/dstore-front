import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';
import { MarcaModel } from '../../models/marca.model';
import { PageResponse } from '../../models/common/page-response.model';
import { MarcaService } from '../../services/marca.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-marca',
  imports: [CommonModule, FormsModule],
  templateUrl: './marca.html',
  styleUrls: ['./marca.scss'],
})
export class Marca implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  marcas: MarcaModel[] = [];
  nombreBusqueda = '';
  estadoSeleccionado: '' | 'true' | 'false' = '';
  direccion: 'asc' | 'desc' = 'asc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  errorListado = '';
  errorEstado = '';

  modalAbierto = false;
  editando = false;
  guardando = false;
  errorModal = '';
  marcaActual: MarcaModel = { id: null, nombre: '', activo: true };

  constructor(private marcaService: MarcaService) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        return this.marcaService.getPaginados({
          nombre: this.nombreBusqueda.trim(),
          activo: this.estadoSeleccionado === '' ? null : this.estadoSeleccionado === 'true',
          page: this.pagina,
          size: this.tamano,
          ordenarPor: 'nombre',
          direccion: this.direccion,
        }).pipe(catchError(error => {
          console.error('Error al consultar marcas:', error);
          this.errorListado = 'No fue posible cargar las marcas.';
          return of({ content: [], totalElements: 0, totalPages: 0,
            page: this.pagina, size: this.tamano } as PageResponse<MarcaModel>);
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (!this.errorListado && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.recarga$.next();
        return;
      }
      this.marcas = respuesta.content;
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
  aplicarFiltros(): void { this.pagina = 0; this.getMarcas(); }
  limpiarFiltros(): void {
    this.nombreBusqueda = '';
    this.estadoSeleccionado = '';
    this.aplicarFiltros();
  }
  ordenarNombre(): void {
    this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    this.pagina = 0;
    this.getMarcas();
  }
  cambiarTamano(size: number): void {
    this.tamano = Number(size);
    this.pagina = 0;
    this.getMarcas();
  }
  irPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas || page === this.pagina) return;
    this.pagina = page;
    this.getMarcas();
  }
  getMarcas(): void { this.recarga$.next(); }

  abrirModal(): void {
    this.editando = false;
    this.errorModal = '';
    this.resetMarcaActual();
    this.modalAbierto = true;
  }
  cerrarModal(): void {
    if (this.guardando) return;
    this.modalAbierto = false;
  }
  editarMarca(marca: MarcaModel): void {
    this.editando = true;
    this.errorModal = '';
    this.marcaActual = { ...marca };
    this.modalAbierto = true;
  }
  guardarMarca(): void {
    if (this.guardando) return;
    const nombre = this.marcaActual.nombre.trim();
    if (!nombre) return;

    this.marcaActual.nombre = nombre;
    this.errorModal = '';
    this.guardando = true;

    const accion = this.editando
      ? this.marcaService.update(this.marcaActual)
      : this.marcaService.create(this.marcaActual);

    accion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.getMarcas();
      },
      error: error => {
        this.guardando = false;
        this.errorModal = error?.error?.mensaje || 'No fue posible guardar la marca.';
        console.error('Error al guardar marca:', error);
      }
    });
  }

  async cambiarEstadoMarca(marca: MarcaModel): Promise<void> {
    if (marca.id === null) return;
    this.errorEstado = '';

    const nuevoEstado = !marca.activo;
    const verbo = nuevoEstado ? 'Activar' : 'Desactivar';

    const confirmado = await this.confirmDialog.confirmar({
      titulo: `${verbo} marca`,
      mensaje: `¿Deseas ${verbo.toLowerCase()} la marca «${marca.nombre}»?`,
      detalle: nuevoEstado
        ? 'La marca volverá a estar disponible para nuevas selecciones.'
        : 'La marca dejará de estar disponible para nuevas selecciones.',
      textoConfirmar: verbo,
      variante: nuevoEstado ? 'primary' : 'danger',
    });

    if (!confirmado) return;

    this.marcaService.cambiarEstado(marca.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.getMarcas(),
        error: error => {
          this.errorEstado = error?.error?.mensaje || 'No fue posible cambiar el estado de la marca.';
          console.error('Error al cambiar estado de marca:', error);
        }
      });
  }

  resetMarcaActual(): void {
    this.marcaActual = { id: null, nombre: '', activo: true };
  }
}
