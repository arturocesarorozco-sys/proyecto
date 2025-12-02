import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisrecetaCard } from './misreceta-card';

describe('MisrecetaCard', () => {
  let component: MisrecetaCard;
  let fixture: ComponentFixture<MisrecetaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisrecetaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisrecetaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
