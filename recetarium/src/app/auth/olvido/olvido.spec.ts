import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Olvido } from './olvido';

describe('Olvido', () => {
  let component: Olvido;
  let fixture: ComponentFixture<Olvido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Olvido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Olvido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
