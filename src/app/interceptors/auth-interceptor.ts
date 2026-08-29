import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  const request = token

    ? req.clone({
        setHeaders:{ Authorization: `Bearer ${token}` }
      })
    : req;

  return next(request).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        authService.logout();

        router.navigate(['/login'], {
          queryParams: {
            sesionExpirada: true
          }
        });
      }

      return throwError(() => error);
    })

  )
};
