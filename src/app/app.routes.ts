import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { Roles } from './pages/roles/roles';
import { Categoria } from './pages/categoria/categoria';
import { Presentacion } from './pages/presentacion/presentacion';
import { Marca } from './pages/marca/marca';
import { Producto } from './pages/producto/producto';
import { Caja } from './pages/caja/caja';
import { Venta } from './pages/venta/venta';
import { DetalleVenta } from './pages/detalle-venta/detalle-venta';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { Cliente } from './pages/cliente/cliente';
import { EntradaInventario } from './pages/entrada-inventario/entrada-inventario';
import { Existencias } from './pages/existencias/existencias';
import { ProximosVencer } from './pages/proximos-vencer/proximos-vencer';
import { MovimientoInventario } from './pages/movimiento-inventario/movimiento-inventario';
import { AjusteInventario } from './pages/ajuste-inventario/ajuste-inventario';
import { NuevaVenta } from './pages/nueva-venta/nueva-venta';


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
      { path: 'categoria', component: Categoria },
      { path: 'presentacion', component: Presentacion },
      { path: 'marca', component: Marca },
      { path: 'producto', component: Producto },
      // { path: 'caja', component: Caja },
      { path: 'venta', component: Venta },
      { path: 'detalle-venta/:id', component: DetalleVenta },
      { path: 'clientes', component: Cliente},
      { path: 'entradas-inventario', component: EntradaInventario},
      { path: 'existencias', component: Existencias},
      { path: 'proximos-vencer', component: ProximosVencer},
      { path: 'movimientos-inventario', component: MovimientoInventario},
      { path: 'ajuste-inventario', component: AjusteInventario},
      { path: 'nueva-venta', component: NuevaVenta}
    ]
  },

  { path: '**', redirectTo: '/inicio' }
];
