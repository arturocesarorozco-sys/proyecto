import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleMenu } from './bubble-menu';

describe('BubbleMenu', () => {
  let component: BubbleMenu;
  let fixture: ComponentFixture<BubbleMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubbleMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubbleMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
