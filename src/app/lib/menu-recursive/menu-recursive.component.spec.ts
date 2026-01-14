import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRecursiveComponent } from './menu-recursive.component';

describe('MenuRecursiveComponent', () => {
  let component: MenuRecursiveComponent;
  let fixture: ComponentFixture<MenuRecursiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuRecursiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuRecursiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
