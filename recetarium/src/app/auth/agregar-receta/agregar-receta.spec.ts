import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarReceta } from './agregar-receta';

describe('AgregarReceta', () => {
  let component: AgregarReceta;
  let fixture: ComponentFixture<AgregarReceta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarReceta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarReceta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
