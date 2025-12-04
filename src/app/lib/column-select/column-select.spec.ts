import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSelect } from './column-select';

describe('ColumnSelect', () => {
  let component: ColumnSelect;
  let fixture: ComponentFixture<ColumnSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
