// --- MOCK DEFINITIONS ---

import { TableService } from './table-service';
import { ColumnState } from './table-state';

// Define a test interface
interface TestData {
  id: number;
  name: string;
  value: number;
  category: string;
}

// Mock Data
const MOCK_DATA: TestData[] = [
  { id: 1, name: 'Apple', value: 100, category: 'Fruit' },
  { id: 2, name: 'Banana', value: 50, category: 'Fruit' },
  { id: 3, name: 'Carrot', value: 200, category: 'Vegetable' },
  { id: 4, name: 'Orange', value: 75, category: 'Fruit' },
];

// Mock Column Configuration used for the new setInitialConfig method
const MOCK_COLUMNS_CONFIG: ColumnState<TestData>[] = [
  { field: 'id', label: 'ID', type: 'number', sticky: true },
  { field: 'name', label: 'Item Name', type: 'text', visible: false }, // Explicitly hidden
  { field: 'value', label: 'Value', type: 'number' },
  { field: 'category', label: 'Category', type: 'text', visible: true }, // Explicitly visible
];

// --- TEST SUITE ---

describe('TableService<TestData>', () => {
  let service: TableService<TestData>;

  // Initialize the service instance directly and configure it before each test
  beforeEach(() => {
    service = new TableService<TestData>();

    // Use the new signature: setInitialConfig(data, columns, identifier)
    service.setInitialConfig(
      MOCK_DATA,
      MOCK_COLUMNS_CONFIG,
      'id' // Identifier for the table rows
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with the correct data and default sort/visibility state', () => {
    // Check initial data length
    expect(service.tableData().length).toBe(MOCK_DATA.length);

    // Check default sort state (ID ascending)
    const initialState = service.state();
    expect(initialState.sort.key).toBe('id');
    expect(initialState.sort.direction).toBe('asc');

    // Check initial column visibility based on configuration
    expect(initialState.columnVisibility['name']).toBe(false); // Should be false due to config
    expect(initialState.columnVisibility['value']).toBe(true); // Should be true (default)
    expect(initialState.columnVisibility['category']).toBe(true); // Should be true (explicitly set)

    expect(initialState.columns.length).toBe(MOCK_COLUMNS_CONFIG.length);
  });

  it('should correctly filter data based on the "name" property (global search)', () => {
    // Action: Update filter state
    service.updateFilter('apple');

    // Assertion: Check the resultant tableData signal
    const filteredData = service.tableData();
    expect(filteredData.length).toBe(1);
    expect(filteredData[0].name).toBe('Apple');

    // Action: Update filter to match multiple items
    service.updateFilter('Fruit');
    const multiMatchData = service.tableData();
    expect(multiMatchData.length).toBe(3);

    // Action: Clear filter
    service.updateFilter('');
    expect(service.tableData().length).toBe(MOCK_DATA.length); // Back to full data
  });

  it('should sort data by "value" in descending order', () => {
    // Action: Update sort state
    service.updateSort('value', 'desc');

    // Assertion: Check order
    const sortedData = service.tableData();
    expect(sortedData[0].name).toBe('Carrot'); // 200
    expect(sortedData[3].name).toBe('Banana'); // 50
  });

  it('should handle sorting by a string column like "name" in ascending order', () => {
    // Action: Update sort state
    service.updateSort('name', 'asc');

    // Assertion: Check alphabetical order
    const sortedData = service.tableData();
    expect(sortedData[0].name).toBe('Apple');
    expect(sortedData[3].name).toBe('Orange');
  });

  it('should filter AND then sort the resultant data set', () => {
    // 1. Action: Filter only for "Fruit" (Apple, Banana, Orange)
    service.updateFilter('Fruit');

    // 2. Action: Sort the filtered result by "value" ascending
    service.updateSort('value', 'asc');

    // Assertion: The smallest value from the filtered set should be first.
    const combinedData = service.tableData();
    expect(combinedData.length).toBe(3); // Filter check

    // Banana (50) should be first among the fruits
    expect(combinedData[0].name).toBe('Banana');

    // Apple (100) should be third among the fruits
    expect(combinedData[2].name).toBe('Apple');
  });

  it('should update column visibility state without affecting tableData', () => {
    // Action: Hide the 'category' column
    service.toggleColumn('category', false);

    // Assertion 1: Verify state change
    expect(service.state().columnVisibility['category']).toBe(false);

    // Assertion 2: Verify data output is UNCHANGED (visibility is handled by the MatTable template)
    expect(service.tableData().length).toBe(MOCK_DATA.length);
  });

  it('should respect the "visible" property in initial column configuration', () => {
    // Redefine a service instance with specific visibility configuration
    const customConfig: ColumnState<TestData>[] = [
      { field: 'id', label: 'ID', type: 'number' }, // Default visible (true)
      { field: 'name', label: 'Item Name', type: 'text', visible: false }, // Explicitly hidden (false)
      { field: 'value', label: 'Value', type: 'number' }, // Default visible (true)
    ];

    const dedicatedService = new TableService<TestData>();
    dedicatedService.setInitialConfig(MOCK_DATA, customConfig, 'id');

    const initialState = dedicatedService.state();

    // Assert explicit false setting
    expect(initialState.columnVisibility['name']).toBe(false);

    // Assert default true setting (id)
    expect(initialState.columnVisibility['id']).toBe(true);

    // Assert default true setting (value)
    expect(initialState.columnVisibility['value']).toBe(true);
  });
});
