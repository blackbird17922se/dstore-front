import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProximosVencer } from './proximos-vencer';

describe('ProximosVencer', () => {
  let component: ProximosVencer;
  let fixture: ComponentFixture<ProximosVencer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximosVencer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProximosVencer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
