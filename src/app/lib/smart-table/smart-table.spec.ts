import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTable } from './smart-table';

describe('SmartTable', () => {
  let component: SmartTable;
  let fixture: ComponentFixture<SmartTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
