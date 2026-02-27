import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';
import { TipoProducto } from './pages/tipo-producto/tipo-producto';
import { Presentacion } from './pages/presentacion/presentacion';
import { Marca } from './pages/marca/marca';
import { Producto } from './pages/producto/producto';
import { Caja } from './pages/caja/caja';
import { Venta } from './pages/venta/venta';
import { DetalleVenta } from './pages/detalle-venta/detalle-venta';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: Inicio },
      { path: 'usuarios', component: Usuarios },
      { path: 'roles', component: Roles },
      { path: 'tipo-producto', component: TipoProducto },
      { path: 'presentacion', component: Presentacion },
      { path: 'marca', component: Marca },
      { path: 'producto', component: Producto },
      { path: 'caja', component: Caja },
      { path: 'venta', component: Venta },
      { path: 'detalle-venta/:id', component: DetalleVenta }
    ]
  },

  { path: '**', redirectTo: '/inicio' }
];
