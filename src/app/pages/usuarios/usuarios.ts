import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RolModel } from '../../models/rol.model';
import { RolService } from '../../services/rol.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponseModel } from '../../models/usuario/usuario-response.model';
import { UsuarioForm } from '../../models/usuario/usuario-form.model';
import { UsuarioUpdateRequest } from '../../models/usuario/usuario-update-request.model';
import { UsuarioCreateRequest } from '../../models/usuario/usuario-create-request.model';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

type VistaUsuarios = 'listado' | 'detalle' | 'nuevo';
type SeccionUsuario = 'resumen' | 'datos' | 'rol' | 'estado';
type FiltroEstado = 'todos' | 'activos' | 'inactivos';
type TipoMensaje = 'exito' | 'error' | null;

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
})
export class Usuarios {
  private readonly confirmDialog = inject(ConfirmDialogService);

  usuarioResponse: UsuarioResponseModel[] = [];
  roles: RolModel[] = [];

  cargando = true;
  cargandoRoles = true;
  errorCarga = '';
  errorRoles = '';
  guardando = false;

  vistaActual: VistaUsuarios = 'listado';
  seccionActiva: SeccionUsuario = 'resumen';
  cuentaSeleccionada: UsuarioResponseModel | null = null;

  busqueda = '';
  filtroEstado: FiltroEstado = 'todos';
  filtroRol = 'todos';
  pagina = 1;
  readonly tamanoPagina = 8;

  mensaje = '';
  tipoMensaje: TipoMensaje = null;

  // La identidad de la sesión se consulta para no desactivar ni cambiar
  // el rol de la propia cuenta desde este módulo administrativo.
  idUsuarioSesion: number | null = null;
  validandoSesion = true;

  usuarioActual: UsuarioForm = this.usuarioVacio();

  constructor(
    private rolService: RolService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.listarUsuarios();
    this.getRoles();
    this.verificarUsuarioSesion();
  }

  getRoles(): void {
    this.cargandoRoles = true;
    this.errorRoles = '';
    this.rolService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.cargandoRoles = false;
      },
      error: (error) => {
        console.error('Error al obtener Roles:', error);
        this.errorRoles = 'No se pudieron cargar los roles disponibles.';
        this.cargandoRoles = false;
      }
    });
  }

  listarUsuarios(): void {
    this.cargando = true;
    this.errorCarga = '';
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarioResponse = data;
        if (this.cuentaSeleccionada) {
          this.cuentaSeleccionada = data.find(u => u.id === this.cuentaSeleccionada?.id) ?? null;
          if (!this.cuentaSeleccionada) this.volverListado();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener Usuarios:', error);
        this.errorCarga = 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
      }
    });
  }

  verificarUsuarioSesion(): void {
    this.validandoSesion = true;
    this.usuarioService.obtenerPerfil().subscribe({
      next: perfil => {
        this.idUsuarioSesion = perfil.id;
        this.validandoSesion = false;
      },
      error: (error) => {
        console.error('Error al identificar la sesión:', error);
        this.idUsuarioSesion = null;
        this.validandoSesion = false;
      }
    });
  }

  private usuarioVacio(): UsuarioForm {
    return {
      id: null,
      nombre: '',
      apellido: '',
      nombreUsuario: '',
      contrasena: '',
      idRol: null
    };
  }

  private cargarFormulario(usuario: UsuarioResponseModel): void {
    this.usuarioActual = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombreUsuario: usuario.nombreUsuario,
      contrasena: '',
      idRol: usuario.idRol
    };
  }

  // Inspiración Windows Vista: elegir una cuenta y luego una acción concreta.
  seleccionarUsuario(usuario: UsuarioResponseModel): void {
    this.cuentaSeleccionada = usuario;
    this.cargarFormulario(usuario);
    this.vistaActual = 'detalle';
    this.seccionActiva = 'resumen';
    this.limpiarMensaje();
  }

  abrirSeccion(seccion: SeccionUsuario): void {
    if (!this.cuentaSeleccionada || this.guardando) return;
    this.seccionActiva = seccion;
    this.cargarFormulario(this.cuentaSeleccionada);
    this.limpiarMensaje();
  }

  openModal(): void {
    // Se conserva el nombre del método para facilitar la transición desde la vista antigua.
    this.usuarioActual = this.usuarioVacio();
    this.vistaActual = 'nuevo';
    this.cuentaSeleccionada = null;
    this.seccionActiva = 'resumen';
    this.limpiarMensaje();
  }

  volverListado(): void {
    this.vistaActual = 'listado';
    this.cuentaSeleccionada = null;
    this.seccionActiva = 'resumen';
    this.usuarioActual = this.usuarioVacio();
    this.limpiarMensaje();
  }

  get usuariosFiltrados(): UsuarioResponseModel[] {
    const buscar = this.normalizar(this.busqueda);
    return this.usuarioResponse
      .filter(u => {
        const coincideTexto = !buscar || this.normalizar(
          `${u.nombre} ${u.apellido} ${u.nombreUsuario} ${u.nombreRol}`
        ).includes(buscar);
        const coincideEstado = this.filtroEstado === 'todos' ||
          (this.filtroEstado === 'activos' ? u.activo : !u.activo);
        const coincideRol = this.filtroRol === 'todos' || u.nombreRol === this.filtroRol;
        return coincideTexto && coincideEstado && coincideRol;
      })
      .sort((a, b) => a.nombreUsuario.localeCompare(b.nombreUsuario, 'es'));
  }

  get usuariosPagina(): UsuarioResponseModel[] {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.tamanoPagina));
  }

  get usuariosActivos(): number {
    return this.usuarioResponse.filter(u => u.activo).length;
  }

  get usuariosInactivos(): number {
    return this.usuarioResponse.length - this.usuariosActivos;
  }

  cambiarFiltros(): void {
    this.pagina = 1;
  }

  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.pagina = pagina;
  }

  private normalizar(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  iniciales(usuario: UsuarioResponseModel): string {
    return ([usuario.nombre, usuario.apellido]
      .map(valor => valor?.trim().charAt(0) ?? '')
      .join('') || usuario.nombreUsuario.substring(0, 2)).toUpperCase();
  }

  get esCuentaPropia(): boolean {
    return !!this.cuentaSeleccionada && this.idUsuarioSesion !== null &&
      this.cuentaSeleccionada.id === this.idUsuarioSesion;
  }

  get esUltimoAdminActivo(): boolean {
    if (!this.cuentaSeleccionada?.activo ||
        this.cuentaSeleccionada.nombreRol.toUpperCase() !== 'ADMIN') return false;

    return this.usuarioResponse.filter(u =>
      u.activo && u.nombreRol.toUpperCase() === 'ADMIN'
    ).length <= 1;
  }

  get puedeModificarRol(): boolean {
    return !!this.cuentaSeleccionada && !this.validandoSesion &&
      this.idUsuarioSesion !== null && !this.esCuentaPropia &&
      !this.esUltimoAdminActivo;
  }

  get puedeCambiarEstado(): boolean {
    return this.puedeModificarRol;
  }

  get hayCambiosDatos(): boolean {
    const u = this.cuentaSeleccionada;
    return !!u && (
      u.nombre !== this.usuarioActual.nombre.trim() ||
      u.apellido !== this.usuarioActual.apellido.trim()
    );
  }

  get hayCambiosRol(): boolean {
    return !!this.cuentaSeleccionada &&
      this.cuentaSeleccionada.idRol !== this.usuarioActual.idRol;
  }

  private limpiarMensaje(): void {
    this.mensaje = '';
    this.tipoMensaje = null;
  }

  private mostrarError(error: { error?: { mensaje?: string; message?: string } }, respaldo: string): void {
    this.tipoMensaje = 'error';
    this.mensaje = error?.error?.mensaje || error?.error?.message || respaldo;
  }

  guardarUsuario(formulario: NgForm): void {
    if (this.guardando || this.vistaActual !== 'nuevo' || formulario.invalid) return;
    const nombre = this.usuarioActual.nombre.trim();
    const apellido = this.usuarioActual.apellido.trim();
    const nombreUsuario = this.usuarioActual.nombreUsuario.trim();
    if (!nombre || !apellido || !nombreUsuario || !this.usuarioActual.contrasena ||
        this.usuarioActual.contrasena.length < 6 || this.usuarioActual.idRol === null) return;

    // CONTRASEÑA SOLAMENTE AL CREAR: no existe un endpoint administrativo
    // para cambiar la contraseña de otros usuarios en la versión actual.
    const request: UsuarioCreateRequest = {
      nombre,
      apellido,
      nombreUsuario,
      contrasena: this.usuarioActual.contrasena,
      idRol: this.usuarioActual.idRol
    };
    this.guardando = true;
    this.limpiarMensaje();
    this.usuarioService.crearUsuario(request).subscribe({
      next: () => {
        this.guardando = false;
        this.volverListado();
        this.tipoMensaje = 'exito';
        this.mensaje = `Se creó correctamente la cuenta «${nombreUsuario}».`;
        this.listarUsuarios();
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.guardando = false;
        this.mostrarError(error, 'No fue posible crear el usuario.');
      }
    });
  }

  guardarCambios(tipo: 'datos' | 'rol', formulario: NgForm): void {
    if (this.guardando || !this.cuentaSeleccionada || formulario.invalid ||
        this.usuarioActual.id === null || this.usuarioActual.idRol === null) return;

    const nombre = this.usuarioActual.nombre.trim();
    const apellido = this.usuarioActual.apellido.trim();
    if (!nombre || !apellido) return;
    if (tipo === 'datos' && !this.hayCambiosDatos) return;
    if (tipo === 'rol' && (!this.hayCambiosRol || !this.puedeModificarRol)) return;

    // UsuarioUpdateDTO en Spring Boot admite nombre, apellido e idRol.
    // Se mantiene nombreUsuario en el request por compatibilidad con el
    // modelo Angular existente, pero NO se ofrece modificarlo en la UI.
    const request: UsuarioUpdateRequest = {
      nombre,
      apellido,
      nombreUsuario: this.cuentaSeleccionada.nombreUsuario,
      idRol: this.usuarioActual.idRol
    };
    this.guardando = true;
    this.limpiarMensaje();
    this.usuarioService.actualizarUsuario(this.usuarioActual.id, request).subscribe({
      next: () => {
        this.guardando = false;
        this.tipoMensaje = 'exito';
        this.mensaje = tipo === 'rol'
          ? 'El rol de la cuenta se actualizó correctamente.'
          : 'La información personal se actualizó correctamente.';
        this.listarUsuarios();
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.guardando = false;
        this.mostrarError(error, 'No fue posible actualizar la cuenta.');
      }
    });
  }

  async cambiarEstadoUsuario(): Promise<void> {
    const usuario = this.cuentaSeleccionada;
    const id = usuario?.id;
    if (!usuario || id == null || this.guardando) return;
    if (!this.puedeCambiarEstado) {
      this.tipoMensaje = 'error';
      this.mensaje = 'No se permite cambiar el estado de tu propia cuenta ni del último ADMIN activo. Comprueba también tu sesión.';
      return;
    }

    const nuevoEstado = !usuario.activo;
    const verbo = nuevoEstado ? 'Activar' : 'Desactivar';
    const confirmado = await this.confirmDialog.confirmar({
      titulo: `${verbo} usuario`,
      mensaje: `¿Deseas ${verbo.toLowerCase()} la cuenta «${usuario.nombreUsuario}»?`,
      detalle: nuevoEstado
        ? 'El usuario podrá volver a acceder al sistema.'
        : 'El usuario dejará de poder iniciar nuevas sesiones. Revisa el comportamiento de JWT existentes.',
      textoConfirmar: verbo,
      variante: nuevoEstado ? 'primary' : 'danger'
    });
    if (!confirmado) return;

    this.guardando = true;
    this.limpiarMensaje();
    this.usuarioService.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.guardando = false;
        this.tipoMensaje = 'exito';
        this.mensaje = `Cuenta ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`;
        this.listarUsuarios();
      },
      error: (error) => {
        console.error('Error al cambiar estado del usuario:', error);
        this.guardando = false;
        this.mostrarError(error, 'No fue posible cambiar el estado de la cuenta.');
      }
    });
  }
}
