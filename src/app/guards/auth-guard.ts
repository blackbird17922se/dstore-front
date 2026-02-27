import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authServicio = inject(AuthService);
  const enrutador = inject(Router);

  if(authServicio.isLoggedIn()){
    return true;
  }

  enrutador.navigate(['/login']);
  return false;
};
