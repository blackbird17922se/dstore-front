import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../models/login-response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  // Renueva antes de llegar a la expiración del JWT de acceso.
  private readonly margenRenovacionMs = 60_000;

  private refreshEnCurso$: Observable<LoginResponse | null> | null = null;
  private cierreManual = false;

  private loggedInSubject = new BehaviorSubject<boolean>(this.tokenVigenteAlIniciar());
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(nombreUsuario: string, contrasena: string): Observable<LoginResponse> {
    // El backend emite una cookie de refresh HttpOnly además del JWT.
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      nombreUsuario,
      contrasena
    }, { withCredentials: true }).pipe(
      tap(respuesta => {
        this.cierreManual = false;
        this.guardarSesion(respuesta);
      })
    );
  }

  /** Rotación compartida: en una misma pestaña no hacemos refresh paralelo. */
  refrescarSesion(): Observable<LoginResponse | null> {
    if (this.cierreManual) {
      return of(null);
    }
    if (this.refreshEnCurso$) {
      return this.refreshEnCurso$;
    }

    this.refreshEnCurso$ = this.http.post<LoginResponse>(
      `${this.apiUrl}/refresh`, {}, { withCredentials: true }
    ).pipe(
      tap(respuesta => {
        if (!this.cierreManual) this.guardarSesion(respuesta);
      }),
      map(respuesta => respuesta as LoginResponse | null),
      catchError((error: HttpErrorResponse) => {
        // 401/403: el refresh dejó de ser válido o fue revocado.
        // Un fallo de conexión (status 0) no implica una sesión revocada.
        if (error.status === 401 || error.status === 403) {
          this.cierreManual = true;
          this.limpiarSesionLocal();
        }
        return of(null);
      }),
      finalize(() => { this.refreshEnCurso$ = null; }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshEnCurso$;
  }

  /** Se usa en guards e interceptor: obtiene token vigente o intenta renovar. */
  obtenerTokenValido(): Observable<string | null> {
    if (this.cierreManual) {
      return of(null);
    }

    const token = localStorage.getItem('token');
    if (token && this.msRestantes(token) > this.margenRenovacionMs) {
      return of(token);
    }

    return this.refrescarSesion().pipe(
      map(respuesta => {
        if (this.cierreManual) return null;
        if (respuesta?.token) {
          return respuesta.token;
        }
        // Si la renovación falló por una caída temporal de red y el token
        // todavía es válido, se puede seguir utilizando hasta su expiración.
        const actual = localStorage.getItem('token');
        return actual && this.msRestantes(actual) > 0 ? actual : null;
      })
    );
  }

  /** Conservado para los componentes que utilizan este contrato existente. */
  guardarUsuario(usuario: string): void {
    localStorage.setItem('usuario', usuario);
    this.loggedInSubject.next(true);
  }

  /**
   * Conserva la firma void utilizada por el menú actual.
   * Inicia la revocación en el servidor y cierra la vista inmediatamente.
   * Para garantizar la revocación antes de navegar, migra el componente
   * de cuenta a cerrarSesionServidor() y espera el resultado.
   */
  logout(): void {
    this.cierreManual = true;
    this.limpiarSesionLocal();
    this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        error: () => console.warn('No se pudo confirmar la revocación de la sesión en el servidor.')
      });
  }

  /** Para una futura integración del menú de cuenta que espere la revocación. */
  cerrarSesionServidor(): Observable<void> {
    this.cierreManual = true;
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      finalize(() => this.limpiarSesionLocal())
    );
  }

  /** Cuando el servidor rechaza definitivamente el refresh. */
  expirarSesion(): void {
    this.cierreManual = true;
    this.limpiarSesionLocal();
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value && this.tokenActualVigente();
  }

  getUsuario(): string | null {
    return localStorage.getItem('usuario');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  esAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  private guardarSesion(datos: LoginResponse): void {
    localStorage.setItem('token', datos.token);
    localStorage.setItem('rol', datos.rol);
    localStorage.setItem('usuario', datos.nombreUsuario);
    this.loggedInSubject.next(true);
  }

  private limpiarSesionLocal(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    this.loggedInSubject.next(false);
  }

  private tokenVigenteAlIniciar(): boolean {
    return this.tokenActualVigente();
  }

  private tokenActualVigente(): boolean {
    const token = localStorage.getItem('token');
    return !!token && this.msRestantes(token) > 0;
  }

  private msRestantes(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = Number(payload.exp);
      if (!Number.isFinite(exp)) return 0;
      return exp * 1000 - Date.now();
    } catch {
      return 0;
    }
  }
}
