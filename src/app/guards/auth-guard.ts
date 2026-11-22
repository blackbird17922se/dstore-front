import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Antes de abrir una ruta privada, renovar el JWT si está próximo a vencer. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.obtenerTokenValido().pipe(
    map(token => token ? true : router.createUrlTree(['/login']))
  );
};
