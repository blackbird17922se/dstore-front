import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'usuarios', component: Usuarios },
  { path: 'roles', component: Roles },
  { path: '**', redirectTo: '/inicio' }
];
