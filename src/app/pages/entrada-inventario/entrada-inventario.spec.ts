import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EntradaInventario } from './entrada-inventario';
import { EntradaInventarioService } from '../../services/entrada-inventario.service';
import { ProductoService } from '../../services/producto.service';
import { EntradaInventarioResponse } from '../../models/inventario/entrada-inventario-response.model';
import { ProductoModel } from '../../models/producto/producto.model';

describe('EntradaInventario', () => {
  let component: EntradaInventario;
  let fixture: ComponentFixture<EntradaInventario>;
  let entradaService: jasmine.SpyObj<EntradaInventarioService>;
  let productoService: jasmine.SpyObj<ProductoService>;

  const productoConVencimiento = {
    id: 8, nombre: 'Producto de prueba', controlaVencimiento: true,
  } as ProductoModel;

  const entradaCompleta: EntradaInventarioResponse = {
    id: 11,
    fechaEntrada: '2026-11-21',
    fechaRegistro: '2026-11-21T12:00:00',
    numeroDocumento: 'F-100',
    observacion: null,
    detalles: [{
      id: 25, idProducto: 8, nombreProducto: 'Producto de prueba',
      cantidad: 3, numeroLote: 'L1', fechaVencimiento: '2027-02-01',
    }],
  };

  beforeEach(async () => {
    entradaService = jasmine.createSpyObj<EntradaInventarioService>(
      'EntradaInventarioService', ['listarPaginadas', 'listar', 'obtenerPorId', 'registrarEntrada']
    );
    productoService = jasmine.createSpyObj<ProductoService>(
      'ProductoService', ['listarProductosActivos']
    );
    entradaService.listarPaginadas.and.returnValue(of({
      content: [{
        id: 11, fechaEntrada: entradaCompleta.fechaEntrada,
        fechaRegistro: entradaCompleta.fechaRegistro,
        numeroDocumento: entradaCompleta.numeroDocumento, observacion: null,
      }],
      totalElements: 1, totalPages: 1, page: 0, size: 10,
    }));
    entradaService.obtenerPorId.and.returnValue(of(entradaCompleta));
    entradaService.registrarEntrada.and.returnValue(of(entradaCompleta));
    productoService.listarProductosActivos.and.returnValue(of([productoConVencimiento]));

    await TestBed.configureTestingModule({
      imports: [EntradaInventario],
      providers: [
        { provide: EntradaInventarioService, useValue: entradaService },
        { provide: ProductoService, useValue: productoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntradaInventario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and retrieve a paginated list', () => {
    expect(component).toBeTruthy();
    expect(component.entradas.length).toBe(1);
    expect(entradaService.listarPaginadas).toHaveBeenCalled();
  });

  it('allows multiple products in one entry', () => {
    component.abrirModal();
    expect(component.entradaInventarioRequest.detalles.length).toBe(1);
    component.agregarDetalle();
    expect(component.entradaInventarioRequest.detalles.length).toBe(2);
  });

  it('requires expiration date for products that control expiration', () => {
    component.abrirModal();
    const detalle = component.entradaInventarioRequest.detalles[0];
    detalle.idProducto = 8;
    detalle.cantidad = 3;
    detalle.fechaVencimiento = null;
    expect(component.formularioValido).toBeFalse();
    detalle.fechaVencimiento = '2099-01-01';
    expect(component.formularioValido).toBeTrue();
  });

  it('loads complete details only when viewing an entry', () => {
    expect(entradaService.obtenerPorId).not.toHaveBeenCalled();
    component.verDetalle(component.entradas[0]);
    expect(entradaService.obtenerPorId).toHaveBeenCalledWith(11);
    expect(component.entradaSeleccionada?.detalles.length).toBe(1);
  });
});
