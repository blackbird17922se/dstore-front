import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AjusteInventario } from './ajuste-inventario';

describe('AjusteInventario', () => {
  let fixture: ComponentFixture<AjusteInventario>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjusteInventario],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AjusteInventario);
  });
  it('crea el componente', () => expect(fixture.componentInstance).toBeTruthy());
  it('impide confirmar sin elegir existencia', () => {
    const componente = fixture.componentInstance;
    expect(componente.formularioValido).toBeFalse();
  });
});
