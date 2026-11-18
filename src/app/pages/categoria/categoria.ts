import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';
import { CategoriaModel } from '../../models/categoria/categoria.model';
import { PageResponse } from '../../models/common/page-response.model';
import { CategoriaService } from '../../services/categoria.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-categoria',
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.scss'],
})
export class Categoria implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  categorias: CategoriaModel[] = [];
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
  categoriaActual: CategoriaModel = { id: null, nombre: '', activo: true };

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        return this.categoriaService.getPaginados({
          nombre: this.nombreBusqueda.trim(),
          activo: this.estadoSeleccionado === '' ? null : this.estadoSeleccionado === 'true',
          page: this.pagina,
          size: this.tamano,
          ordenarPor: 'nombre',
          direccion: this.direccion,
        }).pipe(catchError(error => {
          console.error('Error al consultar categorías:', error);
          this.errorListado = 'No fue posible cargar las categorías.';
          return of({ content: [], totalElements: 0, totalPages: 0,
            page: this.pagina, size: this.tamano } as PageResponse<CategoriaModel>);
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      if (!this.errorListado && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.recarga$.next();
        return;
      }
      this.categorias = respuesta.content;
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
  aplicarFiltros(): void { this.pagina = 0; this.getCategorias(); }
  limpiarFiltros(): void {
    this.nombreBusqueda = '';
    this.estadoSeleccionado = '';
    this.aplicarFiltros();
  }
  ordenarNombre(): void {
    this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    this.pagina = 0;
    this.getCategorias();
  }
  cambiarTamano(size: number): void {
    this.tamano = Number(size);
    this.pagina = 0;
    this.getCategorias();
  }
  irPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas || page === this.pagina) return;
    this.pagina = page;
    this.getCategorias();
  }
  getCategorias(): void { this.recarga$.next(); }

  abrirModal(): void {
    this.editando = false;
    this.errorModal = '';
    this.resetCategoriaActual();
    this.modalAbierto = true;
  }
  cerrarModal(): void {
    if (this.guardando) return;
    this.modalAbierto = false;
  }
  editarCategoria(categoria: CategoriaModel): void {
    this.editando = true;
    this.errorModal = '';
    this.categoriaActual = { ...categoria };
    this.modalAbierto = true;
  }
  guardarCategoria(): void {
    if (this.guardando) return;
    const nombre = this.categoriaActual.nombre.trim();
    if (!nombre) return;

    this.categoriaActual.nombre = nombre;
    this.errorModal = '';
    this.guardando = true;

    const accion = this.editando
      ? this.categoriaService.update(this.categoriaActual)
      : this.categoriaService.create(this.categoriaActual);

    accion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.getCategorias();
      },
      error: error => {
        this.guardando = false;
        this.errorModal = error?.error?.mensaje || 'No fue posible guardar la categoría.';
        console.error('Error al guardar categoría:', error);
      }
    });
  }

  async cambiarEstadoCategoria(categoria: CategoriaModel): Promise<void> {
    if (categoria.id === null) return;
    this.errorEstado = '';

    const nuevoEstado = !categoria.activo;
    const verbo = nuevoEstado ? 'Activar' : 'Desactivar';

    const confirmado = await this.confirmDialog.confirmar({
      titulo: `${verbo} categoría`,
      mensaje: `¿Deseas ${verbo.toLowerCase()} la categoría «${categoria.nombre}»?`,
      detalle: nuevoEstado
        ? 'La categoría volverá a estar disponible para nuevas selecciones.'
        : 'La categoría dejará de estar disponible para nuevas selecciones.',
      textoConfirmar: verbo,
      variante: nuevoEstado ? 'primary' : 'danger',
    });

    if (!confirmado) return;

    this.categoriaService.cambiarEstado(categoria.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.getCategorias(),
        error: error => {
          this.errorEstado = error?.error?.mensaje || 'No fue posible cambiar el estado de la categoría.';
          console.error('Error al cambiar estado de categoría:', error);
        }
      });
  }

  resetCategoriaActual(): void {
    this.categoriaActual = { id: null, nombre: '', activo: true };
  }
}
