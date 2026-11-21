import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Existencias } from './existencias';
import { ExistenciaProductoService } from '../../services/existencia-producto.service';
import { ProductoService } from '../../services/producto.service';

// Se usan mocks para que la prueba de componente no dependa de la API.
describe('Existencias', () => {
  let component: Existencias;
  let fixture: ComponentFixture<Existencias>;
  let existenciaService: jasmine.SpyObj<ExistenciaProductoService>;

  beforeEach(async () => {
    existenciaService = jasmine.createSpyObj<ExistenciaProductoService>(
      'ExistenciaProductoService', ['listarExistenciasPaginadas', 'obtenerExistencia']
    );
    existenciaService.listarExistenciasPaginadas.and.returnValue(of({
      content: [], totalElements: 0, totalPages: 0, page: 0, size: 10,
    }));
    const productoService = jasmine.createSpyObj<ProductoService>('ProductoService', ['getAll']);
    productoService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Existencias],
      providers: [
        { provide: ExistenciaProductoService, useValue: existenciaService },
        { provide: ProductoService, useValue: productoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Existencias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ordena productos alfabeticamente y alterna a descendente', () => {
    expect(component.ordenarPor).toBe('producto.nombre');
    expect(component.direccion).toBe('asc');
    component.ordenar('producto.nombre');
    expect(component.direccion).toBe('desc');
    expect(existenciaService.listarExistenciasPaginadas).toHaveBeenCalled();
  });

  it('reinicia la pagina al cambiar un filtro', () => {
    component.pagina = 3;
    component.estadoStock = 'true';
    component.aplicarFiltros();
    expect(component.pagina).toBe(0);
    expect(existenciaService.listarExistenciasPaginadas).toHaveBeenCalledWith(
      jasmine.objectContaining({ conStock: true, page: 0 })
    );
  });
});
