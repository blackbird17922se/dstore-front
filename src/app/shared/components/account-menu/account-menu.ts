import { Component, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

/**
 * Datos del perfil propio devueltos por GET /api/v2/usuarios/perfil.
 * No usamos el rol para autorizar acciones: los permisos los valida el backend.
 */
interface CuentaPerfil {
  id: number;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  nombreRol: string;
}

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.scss'
})
export class AccountMenu implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly perfilUrl = `${environment.apiUrl}/usuarios/perfil`;

  abierto = false;
  cargando = false;
  perfil: CuentaPerfil | null = null;

  ngOnInit(): void {
    this.cargarPerfil();
  }

  /** Actualiza los datos al abrir: refleja cambios recientes en Mi perfil. */
  alternarMenu(): void {
    this.abierto = !this.abierto;
    if (this.abierto) {
      this.cargarPerfil();
    }
  }

  cerrarMenu(): void {
    this.abierto = false;
  }

  cargarPerfil(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.http.get<CuentaPerfil>(this.perfilUrl).subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cargando = false;
      },
      error: (error) => {
        // La consulta del perfil no debe impedir abrir el menú o cerrar sesión.
        console.error('No se pudo cargar el perfil de la cuenta:', error);
        this.cargando = false;
      }
    });
  }

  get iniciales(): string {
    const nombre = this.perfil?.nombre?.trim() ?? '';
    const apellido = this.perfil?.apellido?.trim() ?? '';
    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }

    const usuario = this.perfil?.nombreUsuario?.trim() ?? '';
    return (nombre || usuario).slice(0, 2).toUpperCase() || 'DS';
  }

  get nombreVisible(): string {
    return this.perfil?.nombreUsuario || 'Mi cuenta';
  }

  get rolVisible(): string {
    const rol = this.perfil?.nombreRol ?? '';
    if (rol === 'ADMIN') return 'Administrador';
    if (rol === 'VENDEDOR') return 'Vendedor';
    return rol || 'Cuenta personal';
  }

  cerrarSesion(): void {
    this.cerrarMenu();

    this.authService.cerrarSesionServidor().subscribe({
      next: () => {
        void this.router.navigate(['/login'], {
          replaceUrl: true
        });
      },
      error: (error) => {
        console.error(
          'No se pudo confirmar el cierre de sesión:',
          error
        );

        // La sesión local ya se limpia desde AuthService.
        void this.router.navigate(['/login'], {
          replaceUrl: true
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  alHacerClicFuera(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.cerrarMenu();
    }
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrarMenu();
  }
}
