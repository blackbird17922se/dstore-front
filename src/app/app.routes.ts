import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';
import { Proveedores } from './pages/proveedores/proveedores';
import { TipoProducto } from './pages/tipo-producto/tipo-producto';
import { Presentacion } from './pages/presentacion/presentacion';
import { Marca } from './pages/marca/marca';
import { Lote } from './pages/lote/lote';
import { Producto } from './pages/producto/producto';
import { Venta } from './pages/venta/venta';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'usuarios', component: Usuarios },
  { path: 'roles', component: Roles },
  { path: 'proveedores', component: Proveedores },
  { path: 'tipo-producto', component: TipoProducto },
  { path: 'presentacion', component: Presentacion },
  { path: 'marca', component: Marca },
  { path: 'lote', component: Lote },
  { path: 'producto', component: Producto },
  { path: 'venta', component: Venta },
  { path: '**', redirectTo: '/inicio' }
];
