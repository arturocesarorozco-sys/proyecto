import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisrecetaAddCard } from './misreceta-add-card';

describe('MisrecetaAddCard', () => {
  let component: MisrecetaAddCard;
  let fixture: ComponentFixture<MisrecetaAddCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisrecetaAddCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisrecetaAddCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
