import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRecetaCard } from './editar-receta-card';

describe('EditarRecetaCard', () => {
  let component: EditarRecetaCard;
  let fixture: ComponentFixture<EditarRecetaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarRecetaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRecetaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
