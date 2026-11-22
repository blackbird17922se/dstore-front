import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No interferir con dominios externos ni adjuntar JWT a esos destinos.
  if (!req.url.startsWith(`${environment.apiUrl}/`)) return next(req);

  // AuthService envía la cookie HttpOnly en login, refresh y logout.
  // No adjuntar un JWT viejo ni provocar bucles de renovación.
  if (/\/auth\/(login|refresh|logout)(?:[?#]|$)/.test(req.url)) return next(req);

  function conToken(token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  function redirigirAlLogin(): void {
    authService.expirarSesion();
    void router.navigate(['/login'], {
      queryParams: { sesionExpirada: true }, replaceUrl: true
    });
  }

  return authService.obtenerTokenValido().pipe(
    switchMap(token => {
      if (!token) {
        redirigirAlLogin();
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Sesión expirada',
          url: req.url
        }));
      }

      return next(conToken(token)).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 401) return throwError(() => error);

          // El servidor rechazó el JWT. Renovar una sola vez.
          return authService.refrescarSesion().pipe(
            switchMap(renovada => {
              if (!renovada?.token) {
                redirigirAlLogin();
                return throwError(() => error);
              }

              // GET/HEAD son seguros para reintentar de forma automática.
              // No repetimos POST de venta, PATCH de anulación ni otros
              // cambios de estado: el usuario deberá confirmar nuevamente.
              if (req.method === 'GET' || req.method === 'HEAD') {
                return next(conToken(renovada.token)).pipe(
                  catchError((segundoError: HttpErrorResponse) => {
                    if (segundoError.status === 401) redirigirAlLogin();
                    return throwError(() => segundoError);
                  })
                );
              }
              return throwError(() => error);
            })
          );
        })
      );
    })
  );
};
