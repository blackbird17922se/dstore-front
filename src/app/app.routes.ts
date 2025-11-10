import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';
import { Proveedores } from './pages/proveedores/proveedores';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'usuarios', component: Usuarios },
  { path: 'roles', component: Roles },
  { path: 'proveedores', component: Proveedores },
  { path: '**', redirectTo: '/inicio' }
];
