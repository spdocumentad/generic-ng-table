import { computed, Injectable, Signal, signal } from '@angular/core';
import { ColumnState, TableState } from './table-state';
import { SortDirection } from '@angular/material/sort';

// Make the service generic with type T for the data payload
@Injectable()
export class TableService<T> {
  // Define a sensible default state structure
  private DEFAULT_STATE: Omit<
    TableState<T>,
    'data' | 'columns' | 'identifier' | 'selectedRows' | 'maxSelectionLimit'
  > = {
    id: 'default-table',
    sortable: true,
    sort: { key: 'id' as Extract<keyof T, string>, direction: 'asc' },
    filter: '',
    columnVisibility: {},
    disabled: false,
  };

  // --- Core Writable Signal for the entire state ---
  private _state = signal<TableState<T>>({
    ...this.DEFAULT_STATE,
    data: [],
    columns: [],
    identifier: 'id' as Extract<keyof T, string>, // Placeholder identifier
    selectedRows: [], // Initial selected row state
    maxSelectionLimit: undefined, // Default: no limit
  });

  public readonly state = this._state.asReadonly();

  // Computed data signal returns T[] (now uses state().data)
  public readonly tableData: Signal<T[]> = computed(() => {
    let data = [...this.state().data]; // Start with the raw data from the state
    const currentState = this.state();

    // 1. Apply Filter
    if (currentState.filter) {
      data = this.applyFilter(data, currentState.filter);
    }

    // 2. Apply Sort
    if (currentState.sort.direction) {
      data = this.applySort(data, currentState.sort);
    }

    return data;
  });

  /**
   * Sets the initial configuration and data for the table.
   * @param data The array of data objects.
   * @param columns The full column configuration.
   * @param identifier The key property used to identify a row.
   * @param maxSelectionLimit Optional limit for multi-selection.
   */
  setInitialConfig(
    data: T[],
    columns: ColumnState<T>[],
    identifier: Extract<keyof T, string>,
    maxSelectionLimit?: number
  ): void {
    // Calculate initial column visibility based on the 'sticky' flag or a defined hidden state
    const initialVisibility: Record<string, boolean> = {};
    const columnKeys: string[] = [];

    // All columns are visible by default unless explicitly marked as hidden (not part of the simplified config)
    // Here, we just ensure every configured field gets a visibility entry (defaulting to true)
    columns.forEach((col) => {
      columnKeys.push(col.field);
      // If 'visible' is defined, use that value. Otherwise, default to true.
      initialVisibility[col.field] =
        col.visible !== undefined ? col.visible : true;
    });

    const defaultSortKey = columnKeys[0] || 'id';

    this._state.update((current) => ({
      ...current,
      data: data,
      columns: columns,
      identifier: identifier,
      columnVisibility: initialVisibility,
      sort: {
        key: defaultSortKey as Extract<keyof T, string>,
        direction: 'asc',
      },
      selectedRows: [], // Clear selection on initial data load
      maxSelectionLimit: maxSelectionLimit, // Set the limit
    }));
  }

  updateSort(active: Extract<keyof T, string>, direction: SortDirection): void {
    this._state.update((current) => ({
      ...current,
      sort: {
        key: active,
        direction: direction as 'asc' | 'desc' | '',
      },
      // Note: Sorting typically does not clear selection unless explicitly requested
    }));
  }

  updateFilter(filterValue: string): void {
    this._state.update((current) => ({
      ...current,
      filter: filterValue,
      selectedRows: [], // REQUIREMENT: Clear selection when filter changes
    }));
  }

  /**
   * Toggles the selection state of a specific row, supporting multiple selections.
   * Returns true if selection/deselection was successful, false if limit was reached.
   * @param row The row data object.
   */
  toggleRowSelection(row: T): boolean {
    let success = false;
    this._state.update((current) => {
      const currentSelectedRows = current.selectedRows;
      const identifierKey = current.identifier;
      const limit = current.maxSelectionLimit;

      // Check if the row is already selected based on its unique identifier
      const isSelected = currentSelectedRows.some(
        (selected) =>
          (selected as any)[identifierKey] === (row as any)[identifierKey]
      );

      let newSelectedRows: T[];

      if (isSelected) {
        // Deselect: filter out the current row
        newSelectedRows = currentSelectedRows.filter(
          (selected) =>
            (selected as any)[identifierKey] !== (row as any)[identifierKey]
        );
        success = true;
      } else {
        // Select: check limit before adding
        if (limit === undefined || currentSelectedRows.length < limit) {
          // Add the new row to the array
          newSelectedRows = [...currentSelectedRows, row];
          success = true;
        } else {
          // Limit reached, keep current array
          newSelectedRows = currentSelectedRows;
          success = false;
        }
      }

      return {
        ...current,
        selectedRows: newSelectedRows,
      };
    });
    return success;
  }

  toggleColumn(columnId: string, isVisible: boolean): void {
    this._state.update((current) => ({
      ...current,
      columnVisibility: { ...current.columnVisibility, [columnId]: isVisible },
    }));
  }

  // --- Core Processing Logic (Now type-safe with T) ---

  // Filtering remains generic, checking string conversion of values
  private applyFilter(data: T[], filter: string): T[] {
    const lowerCaseFilter = filter.toLowerCase();

    // Get the fields that are currently configured for filtering (usually all of them)
    const filterableFields = this.state().columns.map((c) => c.field);

    return data.filter((item) =>
      filterableFields.some((field) => {
        const value = (item as any)[field];
        return String(value).toLowerCase().includes(lowerCaseFilter);
      })
    );
  }

  // Sorting relies on the active column key existing on the object T
  private applySort(
    data: T[],
    sort: { key: Extract<keyof T, string>; direction: SortDirection }
  ): T[] {
    const multiplier = sort.direction === 'asc' ? 1 : -1;

    return data.sort((a, b) => {
      // Use index signature to access the property generically
      const aVal = (a as any)[sort.key];
      const bVal = (b as any)[sort.key];

      if (aVal < bVal) return -1 * multiplier;
      if (aVal > bVal) return 1 * multiplier;
      return 0;
    });
  }
}
