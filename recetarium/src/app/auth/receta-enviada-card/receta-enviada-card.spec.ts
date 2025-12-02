import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetaEnviadaCard } from './receta-enviada-card';

describe('RecetaEnviadaCard', () => {
  let component: RecetaEnviadaCard;
  let fixture: ComponentFixture<RecetaEnviadaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecetaEnviadaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecetaEnviadaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
