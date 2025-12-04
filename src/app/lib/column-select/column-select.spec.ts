import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSelect } from './column-select';
import { signal } from '@angular/core';
import { TableService } from '../table-service';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

// 1. Define Mock Types for testing
interface MockItem {
  id: number;
  name: string;
}

interface MockTableState {
  columns: { field: string; label: string }[];
  columnVisibility: Record<string, boolean>;
}

// 2. Mock the TableService
const mockInitialState: MockTableState = {
  columns: [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
  ],
  columnVisibility: {
    id: true,
    name: false,
  },
};

const mockTableService = {
  // Mock the state signal structure required by the component
  state: signal({
    columns: mockInitialState.columns,
    columnVisibility: mockInitialState.columnVisibility,
  }),
  // Mock the method called by onToggle
  toggleColumn: jasmine.createSpy('toggleColumn'),
};

describe('ColumnSelect', () => {
  let component: ColumnSelect<MockItem>;
  // FIX: Changed undefined 'ColumnItem' to the correct component type 'ColumnSelect<MockItem>'
  let fixture: ComponentFixture<ColumnSelect<MockItem>>;
  let tableService: TableService<MockItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnSelect, MatMenuModule, MatCheckboxModule], // Import component and necessary modules
      // Provide the mock service
      providers: [{ provide: TableService, useValue: mockTableService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnSelect<MockItem>);
    component = fixture.componentInstance;
    // Get the actual injected service instance (which is the mock)
    tableService = TestBed.inject(
      TableService
    ) as unknown as TableService<MockItem>;

    // Reset spy before each test
    mockTableService.toggleColumn.calls.reset();

    // Manually run initial change detection
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize columnData correctly based on initial state', () => {
    // Assert the initial computed value from the mock service state
    const data = component.columnData();

    expect(data.length).toBe(2);

    // Check 'id' column
    expect(data[0].field).toBe('id');
    expect(data[0].label).toBe('ID');
    expect(data[0].isVisible).toBe(true);

    // Check 'name' column
    expect(data[1].field).toBe('name');
    expect(data[1].label).toBe('Name');
    expect(data[1].isVisible).toBe(false);
  });

  it('should update columnData reactively when service state changes', () => {
    // Initial check
    expect(component.columnData()[1].isVisible).toBe(false);

    // 1. Simulate a state change in the service (e.g., 'name' is made visible)
    (tableService.state as any).set({
      columns: mockInitialState.columns,
      columnVisibility: {
        id: true,
        name: true,
      },
    });

    // 2. Check the computed signal value
    expect(component.columnData()[1].isVisible).toBe(true);
  });

  it('should call tableService.toggleColumn with the correct arguments when onToggle is called', () => {
    const mockColumnId = 'name';
    const mockEvent = { checked: true };

    component.onToggle(mockColumnId, mockEvent);

    // Assert that the service method was called once
    expect(tableService.toggleColumn).toHaveBeenCalledTimes(1);

    // Assert that the service method was called with the correct parameters
    expect(tableService.toggleColumn).toHaveBeenCalledWith(mockColumnId, true);
  });

  it('should handle columns with undefined visibility (defaulting to true)', () => {
    // Simulate a state where a new column ('age') is added but not in visibility map
    (tableService.state as any).set({
      columns: [...mockInitialState.columns, { field: 'age', label: 'Age' }],
      columnVisibility: {
        id: true,
        name: false,
      },
    });

    const data = component.columnData();
    const ageColumn = data.find((c) => String(c.field) === 'age');

    // Assert that the new column's visibility defaults to true
    expect(ageColumn).toBeDefined();
    expect(ageColumn?.isVisible).toBe(true);
  });
});
