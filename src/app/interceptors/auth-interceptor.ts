import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/* req
→ petición HTTP

next
→ permite continuar la petición
*/
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  /** Como estamos dentro de una función y no de una clase con constructor, no hacemos:

      constructor(
        private authService: AuthService,
        private router: Router
      ) {}

    Usamos:
      inject(...) 
  */
  // AuthService (de dstore) nos permite posteriormente hacer logout
  const authService = inject(AuthService);
  // para usar las rutas, como el login
  const router = inject(Router);

  /* Si la petición es el login, déjala continuar sin agregar JWT.
  No tendría sentido exigir JWT para obtener el JWT en el login*/
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // Buscamos el token en localstorage
  const token = localStorage.getItem('token');

  const request = token
    // clonamos la petición porque HttpRequest es inmutable
    // y agregamos el header Authorization con el JWT
    ? req.clone({
        setHeaders:{ Authorization: `Bearer ${token}` }
      })
    : req;

  // Esto significa: Ya terminé mi trabajo con esta petición. Déjala continuar.
  /* RxJS: next(request) devuelve un Observable. 
  pipe() permite meter operadores en ese flujo, 
  podemos transformar / interceptar / manejar errores*/
  return next(request).pipe(

    // Si la petición HTTP falla, entra aquí
    // y con HttpErrorResponse accedemos a e.status, e.error, etc
    catchError((error: HttpErrorResponse) => {
      
      // 401: Unauthorized
      if (error.status === 401) {

        // deslogear y borra alli todo token, rol, usuario
        authService.logout();

        // termina la sesion y Redirigir al login
        router.navigate(['/login'], {
          queryParams: {
            sesionExpirada: true
          }
        });
      }
      // el error sigue llegando al subscriber
      return throwError(() => error);
    })

  )

};
