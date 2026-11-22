import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Cliente } from './cliente';
import { ClienteService } from '../../services/cliente.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ClienteBusquedaParams } from '../../models/cliente/cliente-busqueda-params.model';

/* El test usa servicios simulados: no necesita llamadas HTTP reales. */
describe('Cliente', () => {
  let component: Cliente;
  let fixture: ComponentFixture<Cliente>;
  let consultas: ClienteBusquedaParams[];

  beforeEach(async () => {
    consultas = [];

    await TestBed.configureTestingModule({
      imports: [Cliente],
      providers: [
        {
          provide: ClienteService,
          useValue: {
            listarClientesPaginados: (filtros: ClienteBusquedaParams) => {
              consultas.push({ ...filtros });
              return of({ content: [], totalElements: 0, totalPages: 0, page: filtros.page, size: filtros.size });
            },
          },
        },
        {
          provide: ConfirmDialogService,
          useValue: { confirmar: async () => true },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('consulta el endpoint paginado al iniciar', () => {
    expect(consultas.length).toBe(1);
    expect(consultas[0].page).toBe(0);
    expect(consultas[0].size).toBe(10);
    expect(consultas[0].ordenarPor).toBe('nombresApellidos');
  });

  it('envía el filtro de nombre y reinicia la página', () => {
    component.nombreBusqueda = '  Ana  ';
    component.pagina = 3;
    component.aplicarFiltros();

    expect(consultas[consultas.length - 1].nombre).toBe('Ana');
    expect(consultas[consultas.length - 1].page).toBe(0);
  });
});
