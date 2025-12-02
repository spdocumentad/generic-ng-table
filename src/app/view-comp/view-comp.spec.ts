import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewComp } from './view-comp';

describe('ViewComp', () => {
  let component: ViewComp;
  let fixture: ComponentFixture<ViewComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewComp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewComp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
