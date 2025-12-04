import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal, Type } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
// NOTE: Assuming TableState is available from this path as indicated by the original file structure
import { Component } from '@angular/core';
import { TableState } from './table-state';
import { SelectFilter } from './select-filter/select-filter';
import { TableService } from './table-service';

// --- MOCK DEFINITIONS for TableService testing ---

// 1. Define the test interface (matching the structure provided in your query)
interface TestData {
  id: number;
  name: string;
  value: number;
  category: string; // Used for filtering
}

// Interface for the input field configuration
interface MockFilterField {
  field: Extract<keyof TestData, string>; // Now based on TestData
  label: string;
}

// 2. Mock the TableService structure
const mockInitialState: Partial<TableState<TestData>> = {
  id: 'mock-table',
  data: [],
  columns: [],
  identifier: 'id' as Extract<keyof TestData, string>,
  sort: { key: 'id' as Extract<keyof TestData, string>, direction: 'asc' },
  globalFilter: '',
  criteriaFilters: {} as Record<Extract<keyof TestData, string>, string[]>,
  // Update available options to use 'category' and a new field 'name' for variety
  availableFilterOptions: {
    category: ['Fruit', 'Vegetable'],
    name: ['Apple', 'Banana'],
  } as Record<Extract<keyof TestData, string>, string[]>,
  columnVisibility: {},
  selectedRows: [],
};

// Create a mock signal structure that mimics the service's state
const mockStateSignal: WritableSignal<Partial<TableState<TestData>>> =
  signal(mockInitialState);

const mockTableService = {
  state: () => mockStateSignal,
  updateCriteriaFilter: jasmine.createSpy('updateCriteriaFilter'),
};

// Mock the component to avoid templateUrl/styleUrl errors during testing
@Component({
  selector: 'app-select-filter',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
  template: `<!-- Minimal template for signal access testing -->`,
})
class MockSelectFilter<T extends object> extends SelectFilter<T> {}

describe('SelectFilter', () => {
  // Use the new TestData interface
  let component: SelectFilter<TestData>;
  let fixture: ComponentFixture<SelectFilter<TestData>>;
  let tableService: TableService<TestData>;

  // Update filter fields to match TestData keys
  const filterFields: MockFilterField[] = [
    { field: 'category', label: 'Category Filter' },
    { field: 'name', label: 'Name Filter' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Use the mock component which is standalone
      imports: [
        MockSelectFilter,
        MatSelectModule,
        MatFormFieldModule,
        ReactiveFormsModule,
      ],
      providers: [
        // Provide the mock service
        { provide: TableService, useValue: mockTableService },
      ],
    })
      // Override the component token with the mock implementation
      .overrideComponent(SelectFilter as Type<SelectFilter<any>>, {
        set: { template: '<div></div>' }, // Override template to empty for simplicity
      })
      .compileComponents();

    // Create the fixture using the component under test
    fixture = TestBed.createComponent(SelectFilter<TestData>);
    component = fixture.componentInstance;

    // FIX: Use fixture.componentRef.setInput() to correctly set the InputSignal value
    fixture.componentRef.setInput('filterFields', filterFields);

    tableService = TestBed.inject(
      TableService
    ) as unknown as TableService<TestData>;

    // Trigger ngOnInit and subscriptions (which might call updateCriteriaFilter once with [])
    fixture.detectChanges();

    // FIX: Reset spies *after* ngOnInit (via fixture.detectChanges) to ignore initialization emissions
    mockTableService.updateCriteriaFilter.calls.reset();
  });

  it('should create and initialize form controls on ngOnInit', () => {
    // We expect the spy call count to be 0 here since we reset it above
    expect(mockTableService.updateCriteriaFilter).not.toHaveBeenCalled();

    expect(component).toBeTruthy();

    // Should have a control for each filter field
    expect(Object.keys(component.filterControls).length).toBe(2);
    expect(component.filterControls['category']).toBeInstanceOf(FormControl);
    expect(component.filterControls['name']).toBeInstanceOf(FormControl);

    // Initial value should be null ('All')
    expect(component.filterControls['category'].value).toBe(null);
  });

  it('should expose availableOptions reactively', () => {
    // Assert initial options
    expect(component.availableOptions()).toEqual({
      category: ['Fruit', 'Vegetable'],
      name: ['Apple', 'Banana'],
    } as Record<Extract<keyof TestData, string>, string[]>);

    // Simulate a state change in the service
    mockStateSignal.update((state) => ({
      ...state,
      availableFilterOptions: {
        ...state.availableFilterOptions,
        category: ['Fruit'], // 'Vegetable' removed
      } as any,
    }));

    // Assert the computed signal value reflects the change
    expect(component.availableOptions().category.length).toBe(1);
    expect(component.availableOptions().category).toEqual(['Fruit']);
  });

  it('should call updateCriteriaFilter with single array when a value is selected', () => {
    // Use 'category' for testing
    const categoryControl = component.getControl(
      'category' as Extract<keyof TestData, string>
    );

    // 1. Simulate selecting 'Fruit'
    categoryControl.setValue('Fruit');

    // Assert service was called with the correct field and value wrapped in an array
    expect(tableService.updateCriteriaFilter).toHaveBeenCalledWith('category', [
      'Fruit',
    ]);
    // This now correctly expects 1 call, as the initialization call was ignored by the reset
    expect(tableService.updateCriteriaFilter).toHaveBeenCalledTimes(1);
  });

  it('should call updateCriteriaFilter with an empty array when "All" (null) is selected', () => {
    // Use 'name' for testing
    const nameControl = component.getControl(
      'name' as Extract<keyof TestData, string>
    );

    // 1. Set an initial filter to ensure it's removed
    nameControl.setValue('Apple');
    // We must reset again here to ensure we only count the 'null' emission
    mockTableService.updateCriteriaFilter.calls.reset();

    // 2. Simulate selecting 'All' (null)
    nameControl.setValue(null);

    // Assert service was called with the correct field and an empty array
    expect(tableService.updateCriteriaFilter).toHaveBeenCalledWith('name', []);
    expect(tableService.updateCriteriaFilter).toHaveBeenCalledTimes(1);
  });

  it('should return the correct FormControl instance via getControl', () => {
    const control = component.getControl(
      'name' as Extract<keyof TestData, string>
    );
    expect(control).toBe(component.filterControls['name']);

    control.setValue('Banana');
    expect(component.filterControls['name'].value).toBe('Banana');
  });
});
