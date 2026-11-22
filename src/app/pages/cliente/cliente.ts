import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, of, startWith, Subject, switchMap } from 'rxjs';
import { ClienteModel } from '../../models/cliente/cliente.model';
import { ClienteRequest } from '../../models/cliente/cliente-request.model';
import { ClienteResponse } from '../../models/cliente/cliente-response.model';
import { CampoOrdenCliente } from '../../models/cliente/cliente-busqueda-params.model';
import { PageResponse } from '../../models/common/page-response.model';
import { ClienteService } from '../../services/cliente.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

/** @author Mauricio A */
@Component({
  selector: 'app-cliente',
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss',
})
export class Cliente implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly recarga$ = new Subject<void>();
  private readonly busqueda$ = new Subject<string>();

  clientes: ClienteResponse[] = [];
  nombreBusqueda = '';
  documentoBusqueda = '';
  estadoSeleccionado: '' | 'true' | 'false' = '';
  ordenarPor: CampoOrdenCliente = 'nombresApellidos';
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
  clienteDetalle: ClienteResponse | null = null;
  procesandoEstadoId: number | null = null;

  // Como en Productos: detalles adicionales visibles bajo demanda en tarjetas móviles.
  detallesExpandidos = new Set<number>();
  mostrarFiltrosAvanzados = false;

  clienteActual: ClienteModel = this.crearClienteVacio();

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.recarga$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.cargando = true;
        this.errorListado = '';

        return this.clienteService.listarClientesPaginados({
          nombre: this.nombreBusqueda.trim(),
          documento: this.documentoBusqueda.trim(),
          activo: this.estadoSeleccionado === '' ? null : this.estadoSeleccionado === 'true',
          page: this.pagina,
          size: this.tamano,
          ordenarPor: this.ordenarPor,
          direccion: this.direccion,
        }).pipe(catchError(error => {
          console.error('Error al obtener Clientes:', error);
          this.errorListado = 'No fue posible cargar los clientes.';
          return of({
            content: [], totalElements: 0, totalPages: 0,
            page: this.pagina, size: this.tamano,
          } as PageResponse<ClienteResponse>);
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(respuesta => {
      // Si se desactivó el último registro de una página, volver a una página válida.
      if (!this.errorListado && this.pagina > 0 && this.pagina >= respuesta.totalPages) {
        this.pagina = Math.max(0, respuesta.totalPages - 1);
        this.recarga$.next();
        return;
      }

      this.clientes = respuesta.content;
      this.detallesExpandidos.clear();
      this.totalElementos = respuesta.totalElements;
      this.totalPaginas = respuesta.totalPages;
      this.cargando = false;
    });

    this.busqueda$.pipe(
      debounceTime(350),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.aplicarFiltros());
  }

  get hayFiltros(): boolean {
    return !!this.nombreBusqueda.trim()
      || !!this.documentoBusqueda.trim()
      || this.estadoSeleccionado !== '';
  }
  get filtrosAvanzadosActivos(): number { return Number(!!this.documentoBusqueda.trim()); }
  get paginaVisible(): number { return this.totalPaginas === 0 ? 0 : this.pagina + 1; }
  get registroDesde(): number { return this.totalElementos === 0 ? 0 : this.pagina * this.tamano + 1; }
  get registroHasta(): number { return Math.min((this.pagina + 1) * this.tamano, this.totalElementos); }

  alCambiarBusqueda(): void {
    this.busqueda$.next(`${this.nombreBusqueda.trim()}|${this.documentoBusqueda.trim()}`);
  }

  aplicarFiltros(): void {
    this.pagina = 0;
    this.listarClientes();
  }

  limpiarFiltros(): void {
    this.nombreBusqueda = '';
    this.documentoBusqueda = '';
    this.estadoSeleccionado = '';
    this.aplicarFiltros();
  }

  // El backend solo admite ordenar por nombre, documento o fecha de registro.
  ordenar(campo: CampoOrdenCliente): void {
    if (this.ordenarPor === campo) {
      this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = campo;
      this.direccion = 'asc';
    }
    this.pagina = 0;
    this.listarClientes();
  }

  toggleDetalles(id: number): void {
    if (this.detallesExpandidos.has(id)) this.detallesExpandidos.delete(id);
    else this.detallesExpandidos.add(id);
  }

  detalleExpandido(id: number): boolean {
    return this.detallesExpandidos.has(id);
  }

  cambiarTamano(size: number): void {
    this.tamano = Number(size);
    this.pagina = 0;
    this.listarClientes();
  }

  irPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas || page === this.pagina || this.cargando) return;
    this.pagina = page;
    this.listarClientes();
  }

  listarClientes(): void {
    this.recarga$.next();
  }

  abrirModal(): void {
    this.editando = false;
    this.errorModal = '';
    this.resetClienteActual();
    this.modalAbierto = true;
  }

  actualizarCliente(cliente: ClienteResponse): void {
    this.editando = true;
    this.errorModal = '';
    this.clienteActual = { ...cliente };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    if (this.guardando) return;
    this.modalAbierto = false;
  }

  verDetalle(cliente: ClienteResponse): void {
    this.clienteDetalle = cliente;
  }

  cerrarDetalle(): void {
    this.clienteDetalle = null;
  }

  guardarCliente(): void {
    if (this.guardando || !this.clienteActual.nombresApellidos.trim()) return;

    const request: ClienteRequest = {
      tipoDocumento: this.clienteActual.tipoDocumento,
      numeroDocumento: this.valorOpcional(this.clienteActual.numeroDocumento),
      nombresApellidos: this.clienteActual.nombresApellidos.trim(),
      telefono: this.valorOpcional(this.clienteActual.telefono),
      correo: this.valorOpcional(this.clienteActual.correo),
      direccion: this.valorOpcional(this.clienteActual.direccion),
      observacion: this.valorOpcional(this.clienteActual.observacion),
    };

    if (this.editando && this.clienteActual.id === null) return;

    const accion = this.editando
      // el ! se llama non-null assertion operator
      // basicamente lo que hace ! decirle a TypeScript:
      // Confía en mí. En este punto sé que id no es null
      ? this.clienteService.actualizarCliente(this.clienteActual.id!, request)
      : this.clienteService.crearCliente(request);

    this.errorModal = '';
    this.guardando = true;
    accion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.listarClientes();
      },
      error: error => {
        this.guardando = false;
        console.error('Error al guardar cliente:', error);
        this.errorModal = error?.error?.mensaje || error?.error?.message
          || 'No fue posible guardar el cliente. Verifica que el nombre no esté repetido.';
      },
    });
  }

  async cambiarEstadoCliente(cliente: ClienteResponse): Promise<void> {
    if (this.procesandoEstadoId !== null) return;

    const nuevoEstado = !cliente.activo;
    const verbo = nuevoEstado ? 'Activar' : 'Desactivar';
    this.errorEstado = '';

    const confirmado = await this.confirmDialog.confirmar({
      titulo: `${verbo} cliente`,
      mensaje: `¿Deseas ${verbo.toLowerCase()} el cliente «${cliente.nombresApellidos}»?`,
      detalle: nuevoEstado
        ? 'El cliente volverá a aparecer en los listados de clientes activos.'
        : 'El cliente dejará de aparecer en los listados de clientes activos. Su información se conservará.',
      textoConfirmar: verbo,
      variante: nuevoEstado ? 'primary' : 'danger',
    });
    if (!confirmado) return;

    this.procesandoEstadoId = cliente.id;
    this.clienteService.cambiarEstadoCliente(cliente.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.procesandoEstadoId = null;
          this.listarClientes();
        },
        error: error => {
          this.procesandoEstadoId = null;
          this.errorEstado = error?.error?.mensaje || 'No fue posible cambiar el estado del cliente.';
          console.error('Error al cambiar el estado del Cliente:', error);
        },
      });
  }

  resetClienteActual(): void {
    this.clienteActual = this.crearClienteVacio();
  }

  private valorOpcional(valor: string | null): string | null {
    return valor?.trim() || null;
  }

  private crearClienteVacio(): ClienteModel {
    return {
      id: null,
      tipoDocumento: null,
      numeroDocumento: '',
      nombresApellidos: '',
      telefono: '',
      correo: '',
      direccion: '',
      observacion: '',
      fechaRegistro: '',
      activo: true,
    };
  }
}
