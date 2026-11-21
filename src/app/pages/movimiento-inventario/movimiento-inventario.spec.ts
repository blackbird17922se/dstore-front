import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MovimientoInventario } from './movimiento-inventario';
import { MovimientoInventarioService } from '../../services/movimiento-inventario.service';
import { ProductoService } from '../../services/producto.service';
import { MovimientoInventarioResponse } from '../../models/movimiento-inventario.model';

const movimientoPrueba: MovimientoInventarioResponse = {
  id: 12,
  idExistencia: 4,
  idProducto: 8,
  nombreProducto: 'Producto prueba',
  tipo: 'VENTA',
  cantidad: -2,
  fechaMovimiento: '2026-11-21T12:30:00',
  tipoOrigen: 'VENTA',
  idOrigen: 7,
  observacion: null,
};

describe('MovimientoInventario', () => {
  let component: MovimientoInventario;
  let fixture: ComponentFixture<MovimientoInventario>;
  let movimientosService: jasmine.SpyObj<MovimientoInventarioService>;
  let productoService: jasmine.SpyObj<ProductoService>;

  beforeEach(async () => {
    movimientosService = jasmine.createSpyObj<MovimientoInventarioService>(
      'MovimientoInventarioService', ['listarPaginados', 'listarPorProducto']);
    productoService = jasmine.createSpyObj<ProductoService>('ProductoService', ['getAll']);
    movimientosService.listarPaginados.and.returnValue(of({
      content: [movimientoPrueba], totalElements: 1, totalPages: 1, page: 0, size: 10,
    }));
    productoService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MovimientoInventario],
      providers: [
        { provide: MovimientoInventarioService, useValue: movimientosService },
        { provide: ProductoService, useValue: productoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientoInventario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no consulta automáticamente al abrir Movimientos', () => {
    expect(movimientosService.listarPaginados).not.toHaveBeenCalled();
    expect(component.consultaRealizada).toBeFalse();
    expect(component.fechasValidas).toBeTrue();
    expect(component.movimientosResponse.length).toBe(0);
  });

  it('consulta solo al pulsar el botón con fechas válidas', () => {
    component.consultarMovimientos();
    expect(movimientosService.listarPaginados).toHaveBeenCalledTimes(1);
    expect(component.movimientosResponse.length).toBe(1);
    const filtros = movimientosService.listarPaginados.calls.mostRecent().args[0];
    expect(filtros.fechaDesde).toBeTruthy();
    expect(filtros.fechaHasta).toBeTruthy();
    expect(filtros.page).toBe(0);
  });

  it('cambiar filtros cancela la consulta anterior y exige pulsar Consultar de nuevo', () => {
    component.consultarMovimientos();
    component.tipoSeleccionado = 'VENTA';
    component.aplicarFiltros();
    expect(component.consultaRealizada).toBeFalse();
    expect(component.movimientosResponse).toEqual([]);
    expect(movimientosService.listarPaginados).toHaveBeenCalledTimes(1);
    component.consultarMovimientos();
    const filtros = movimientosService.listarPaginados.calls.mostRecent().args[0];
    expect(filtros.tipo).toBe('VENTA');
    expect(movimientosService.listarPaginados).toHaveBeenCalledTimes(2);
  });

  it('mantiene la paginación automática después de consultar explícitamente', () => {
    component.consultarMovimientos();
    component.cambiarTamano(25);
    const filtros = movimientosService.listarPaginados.calls.mostRecent().args[0];
    expect(filtros.size).toBe(25);
    expect(movimientosService.listarPaginados).toHaveBeenCalledTimes(2);
  });

  it('no consulta si falta una fecha', () => {
    component.fechaDesde = '';
    component.aplicarFiltros();
    component.consultarMovimientos();
    expect(component.fechasValidas).toBeFalse();
    expect(movimientosService.listarPaginados).not.toHaveBeenCalled();
  });

  it('identifica la operación de origen', () => {
    expect(component.mostrarOrigen(movimientoPrueba)).toBe('Venta #7');
  });

  it('rechaza rangos de fecha invertidos sin consultar el servidor', () => {
    component.fechaDesde = '2026-11-22';
    component.fechaHasta = '2026-11-21';
    component.aplicarFiltros();
    component.consultarMovimientos();
    expect(component.fechasValidas).toBeFalse();
    expect(movimientosService.listarPaginados).not.toHaveBeenCalled();
  });
});
