import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Abc } from './abc';

describe('Abc', () => {
  let component: Abc;
  let fixture: ComponentFixture<Abc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Abc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Abc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
