import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Misrecetas } from './misrecetas';

describe('Misrecetas', () => {
  let component: Misrecetas;
  let fixture: ComponentFixture<Misrecetas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Misrecetas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Misrecetas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
