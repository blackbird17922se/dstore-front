import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Si existe una sesión renovable, no volver a mostrar Login al pulsar Atrás. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.obtenerTokenValido().pipe(
    map(token => token ? router.createUrlTree(['/inicio']) : true)
  );
};
