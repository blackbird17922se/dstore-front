import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';

import { ProductoModel } from '../../models/producto/producto.model';
import { ProductoResponse } from '../../models/producto/producto-response.model';
import { ProductoRequest } from '../../models/producto/producto-request.model';
import { CampoOrdenProducto, DireccionOrden } from '../../models/producto/producto-busqueda-params.model';
import { PageResponse } from '../../models/common/page-response.model';
import { ProductoService } from '../../services/producto.service';
import { MarcaModel } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';
import { CategoriaModel } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { PresentacionModel } from '../../models/presentacion.model';
import { PresentacionService } from '../../services/presentacion.service';
import { TarifaIvaModel } from '../../models/tarifaIva.model';
import { TarifaIvaService } from '../../services/tarifaIva.service';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrls: ['./producto.scss'],
})
export class Producto implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly busqueda$ = new Subject<string>();
  private readonly recarga$ = new Subject<void>();

  productos: ProductoResponse[] = [];
  marcas: MarcaModel[] = [];
  categorias: CategoriaModel[] = [];
  presentaciones: PresentacionModel[] = [];
  tarifasIva: TarifaIvaModel[] = [];

  // Estado del listado: todo se filtra, ordena y pagina en Spring Boot.
  textoBusqueda = '';
  estadoSeleccionado: '' | 'true' | 'false' = '';
  idCategoriaFiltro: number | null = null;
  idMarcaFiltro: number | null = null;
  idPresentacionFiltro: number | null = null;
  mostrarFiltrosAvanzados = false;
  ordenarPor: CampoOrdenProducto = 'nombre';
  direccion: DireccionOrden = 'asc';
  pagina = 0;
  tamano = 10;
  totalElementos = 0;
  totalPaginas = 0;
  cargando = false;
  errorListado = '';
  detallesExpandidos = new Set<number>();

  modalAbierto = false;
  editando = false;
  guardando = false;
  errorModal = '';
  productoActual: ProductoModel = this.productoVacio();

  constructor(
    private productoService: ProductoService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService,
    private presentacionService: PresentacionService,
    private tarifasIvaService: TarifaIvaService
  ) {}

  ngOnInit(): void {
    // switchMap cancela la petición anterior si el usuario cambia de filtro rápidamente.
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';
        return this.productoService.getPaginados({
          texto: this.textoBusqueda,
          activo: this.estadoSeleccionado === '' ? null : this.estadoSeleccionado === 'true',
          idCategoria: this.idCategoriaFiltro,
          idMarca: this.idMarcaFiltro,
          idPresentacion: this.idPresentacionFiltro,
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        }).pipe(
          catchError(error => {
            console.error('Error al consultar productos paginados:', error);
            this.errorListado = 'No fue posible cargar los productos. Intenta nuevamente.';
            return of({
              content: [], totalElements: 0, totalPages: 0,
              page: this.pagina, size: this.tamano
            } as PageResponse<ProductoResponse>);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      // Evitar quedarse en una página inexistente al desactivar/filtrar el último elemento.
      if (!this.errorListado && this.pagina > 0 && respuesta.totalPages > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = respuesta.totalPages - 1;
        this.recarga$.next();
        return;
      }
      this.productos = respuesta.content;
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

    this.listarMarcasActivas();
    this.listarCategoriasActivas();
    this.listarPresentacionesActivas();
    this.listarTarifasIvaActivas();
  }

  get paginaVisible(): number { return this.totalPaginas === 0 ? 0 : this.pagina + 1; }
  get registroDesde(): number { return this.totalElementos === 0 ? 0 : this.pagina * this.tamano + 1; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }
  get hayFiltros(): boolean {
    return !!this.textoBusqueda.trim() || this.estadoSeleccionado !== '' ||
      this.idCategoriaFiltro !== null || this.idMarcaFiltro !== null || this.idPresentacionFiltro !== null;
  }
  get filtrosAvanzadosActivos(): number {
    return Number(this.idCategoriaFiltro !== null) + Number(this.idMarcaFiltro !== null) +
      Number(this.idPresentacionFiltro !== null);
  }

  alCambiarBusqueda(valor: string): void { this.busqueda$.next(valor); }

  aplicarFiltros(): void {
    this.pagina = 0;
    this.getProductos();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.estadoSeleccionado = '';
    this.idCategoriaFiltro = null;
    this.idMarcaFiltro = null;
    this.idPresentacionFiltro = null;
    this.aplicarFiltros();
  }

  ordenar(campo: CampoOrdenProducto): void {
    if (this.ordenarPor === campo) {
      this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = campo;
      this.direccion = 'asc';
    }
    this.pagina = 0;
    this.getProductos();
  }

  cambiarTamano(tamano: number): void {
    this.tamano = Number(tamano);
    this.pagina = 0;
    this.getProductos();
  }

  irPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.pagina) return;
    this.pagina = pagina;
    this.getProductos();
  }

  getProductos(): void { this.recarga$.next(); }

  toggleDetalles(id: number): void {
    if (this.detallesExpandidos.has(id)) this.detallesExpandidos.delete(id);
    else this.detallesExpandidos.add(id);
  }
  detalleExpandido(id: number): boolean { return this.detallesExpandidos.has(id); }

  listarMarcasActivas(): void {
    this.marcaService.listarMarcasActivas().subscribe({
      next: data => this.marcas = data,
      error: error => console.error('Error al obtener marcas activas:', error)
    });
  }

  listarCategoriasActivas(): void {
    this.categoriaService.listarCategoriasActivas().subscribe({
      next: data => this.categorias = data,
      error: error => console.error('Error al obtener categorías activas:', error)
    });
  }

  listarPresentacionesActivas(): void {
    this.presentacionService.listarPresentacionesActivas().subscribe({
      next: data => this.presentaciones = data,
      error: error => console.error('Error al obtener presentaciones activas:', error)
    });
  }

  listarTarifasIvaActivas(): void {
    this.tarifasIvaService.listarTarifasIvaActivas().subscribe({
      next: data => this.tarifasIva = data,
      error: error => console.error('Error al obtener tarifas IVA activas:', error)
    });
  }

  abrirModal(): void {
    this.editando = false;
    this.errorModal = '';
    this.resetProductoActual();
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    if (!this.guardando) this.modalAbierto = false;
  }

  @HostListener('document:keydown.escape')
  cerrarModalConEscape(): void { if (this.modalAbierto) this.cerrarModal(); }

  editarProducto(producto: ProductoResponse): void {
    this.editando = true;
    this.errorModal = '';
    // El backend permite null en codigoBarras; el formulario utiliza un string vacío.
    this.productoActual = {
      ...producto,
      codigoBarras: producto.codigoBarras ?? '',
      descripcion: producto.descripcion ?? ''
    };
    this.modalAbierto = true;
  }

  guardarProducto(): void {
    if (this.guardando) return;
    this.errorModal = '';
    const request: ProductoRequest = {
      codigoBarras: this.productoActual.codigoBarras.trim() || null,
      nombre: this.productoActual.nombre.trim(),
      descripcion: this.productoActual.descripcion?.trim() ?? '',
      precio: this.productoActual.precio,
      idCategoria: this.productoActual.idCategoria,
      idPresentacion: this.productoActual.idPresentacion,
      idMarca: this.productoActual.idMarca,
      idTarifaIva: this.productoActual.idTarifaIva,
      controlaVencimiento: this.productoActual.controlaVencimiento,
    };
    const accion = this.editando
      ? this.productoService.update(this.productoActual.id!, request)
      : this.productoService.create(request);
    this.guardando = true;
    accion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        if (!this.editando) this.pagina = 0;
        this.getProductos();
      },
      error: error => {
        this.guardando = false;
        this.errorModal = error?.error?.mensaje || 'No fue posible guardar el producto.';
        console.error('Error al guardar producto:', error);
      }
    });
  }

  cambiarEstadoProducto(producto: ProductoResponse): void {
    const nuevoEstado = !producto.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!confirm(`¿Estás seguro de que deseas ${accion} este producto?`)) return;
    this.productoService.cambiarEstado(producto.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.getProductos(),
        error: error => console.error('Error al cambiar el estado del producto:', error)
      });
  }

  mostrarIva(producto: Pick<ProductoResponse, 'nombreTarifaIva' | 'porcentajeIva'>): string {
    if (producto.nombreTarifaIva === 'EXENTO') return 'Exento';
    if (producto.nombreTarifaIva === 'EXCLUIDO') return 'Excluido';
    return `${producto.porcentajeIva}%`;
  }

  mostrarTarifa(tarifa: TarifaIvaModel): string {
    if (tarifa.tipo === 'EXENTO') return 'Exento';
    if (tarifa.tipo === 'EXCLUIDO') return 'Excluido';
    return `${tarifa.nombre} - ${tarifa.porcentaje}%`;
  }

  resetProductoActual(): void { this.productoActual = this.productoVacio(); }

  private productoVacio(): ProductoModel {
    return {
      id: null,
      codigoBarras: '', nombre: '', descripcion: '', precio: 0, stock: 0,
      idMarca: null, nombreMarca: '',
      idCategoria: null, nombreCategoria: '',
      idPresentacion: null, nombrePresentacion: '',
      idTarifaIva: null, nombreTarifaIva: '', porcentajeIva: 0,
      activo: true, controlaVencimiento: false
    };
  }
}
