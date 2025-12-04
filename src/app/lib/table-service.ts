import { computed, Injectable, Signal, signal } from '@angular/core';
import { ColumnState, TableState } from './table-state';
import { SortDirection } from '@angular/material/sort';

// Make the service generic with type T for the data payload
@Injectable()
export class TableService<T> {
  // Define a sensible default state structure
  private DEFAULT_STATE: Omit<
    TableState<T>,
    | 'data'
    | 'columns'
    | 'identifier'
    | 'selectedRows'
    | 'maxSelectionLimit'
    | 'criteriaFilters'
    | 'availableFilterOptions'
    | 'multiSelect'
  > = {
    id: 'default-table',
    sortable: true,
    sort: { key: 'id' as Extract<keyof T, string>, direction: 'asc' },
    globalFilter: '',
    columnVisibility: {},
    disabled: false,
  };

  // --- Core Writable Signal for the entire state ---
  private _state = signal<TableState<T>>({
    ...this.DEFAULT_STATE,
    data: [],
    columns: [],
    identifier: 'id' as Extract<keyof T, string>, // Placeholder identifier
    multiSelect: false,
    selectedRows: [], // Initial selected row state
    maxSelectionLimit: undefined, // Default: no limit
    criteriaFilters: {} as Record<Extract<keyof T, string>, string[]>, // NEW: Initialize criteria filters
    availableFilterOptions: {} as Record<Extract<keyof T, string>, string[]>, // NEW: Initialize available options
  });

  public readonly state = this._state.asReadonly();

  // Computed data signal returns T[] (now uses state().data)
  public readonly tableData: Signal<T[]> = computed(() => {
    let data = [...this.state().data]; // Start with the raw data from the state
    const currentState = this.state();

    // 1. Apply Global Filter (Text Search)
    if (currentState.globalFilter) {
      data = this.applyGlobalFilter(data, currentState.globalFilter);
    }

    // 2. Apply Criteria Filters (Multi-Select Dropdowns)
    data = this.applyCriteriaFilters(data, currentState.criteriaFilters);

    // 3. Apply Sort
    if (currentState.sort.direction) {
      data = this.applySort(data, currentState.sort);
    }

    return data;
  });

  /**
   * Derives unique options for all fields marked as filterableByCriteria.
   */
  private deriveAvailableFilterOptions(
    data: T[],
    columns: ColumnState<T>[]
  ): Record<Extract<keyof T, string>, string[]> {
    const options: Record<Extract<keyof T, string>, string[]> = {} as Record<
      Extract<keyof T, string>,
      string[]
    >;
    const filterableFields = columns
      .filter((col) => col.filterableByCriteria)
      .map((col) => col.field);

    filterableFields.forEach((field) => {
      const uniqueValues = new Set<string>();
      data.forEach((item) => {
        const value = (item as any)[field];
        // Format boolean values to 'Yes'/'No' or string representations
        const stringValue =
          typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
        if (stringValue) {
          uniqueValues.add(stringValue);
        }
      });
      options[field] = Array.from(uniqueValues).sort();
    });
    return options;
  }

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
    multiSelect: boolean = false,
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

    const availableFilterOptions = this.deriveAvailableFilterOptions(
      data,
      columns
    );

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
      multiSelect: multiSelect,
      selectedRows: [], // Clear selection on initial data load
      maxSelectionLimit: maxSelectionLimit, // Set the limit
      criteriaFilters: {} as Record<Extract<keyof T, string>, string[]>,
      availableFilterOptions: availableFilterOptions,
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

  updateGlobalFilter(filterValue: string): void {
    this._state.update((current) => ({
      ...current,
      globalFilter: filterValue,
      selectedRows: [], // Clear selection when filter changes
    }));
  }

  /**
   * Updates the selected criteria values for a specific filter field.
   */
  updateCriteriaFilter(
    field: Extract<keyof T, string>,
    selectedValues: string[]
  ): void {
    this._state.update((current) => {
      const newCriteria = { ...current.criteriaFilters };

      if (selectedValues.length > 0) {
        newCriteria[field] = selectedValues;
      } else {
        // Remove the field from the criteria if no options are selected
        delete newCriteria[field];
      }

      return {
        ...current,
        criteriaFilters: newCriteria,
        selectedRows: [], // Clear selection when filter changes
      };
    });
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
      const isMultiSelect = current.multiSelect;

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
        if (!isMultiSelect) {
          // Single-select mode: Replace existing selection with the new row
          newSelectedRows = [row];
          success = true;
        } else if (limit === undefined || currentSelectedRows.length < limit) {
          // Multi-select mode & within limit: Add the new row
          newSelectedRows = [...currentSelectedRows, row];
          success = true;
        } else {
          // Multi-select mode & limit exceeded: Selection failed
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
  private applyGlobalFilter(data: T[], filter: string): T[] {
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

  /**
   * Applies all currently active criteria filters.
   */
  private applyCriteriaFilters(
    data: T[],
    criteria: Record<Extract<keyof T, string>, string[]>
  ): T[] {
    const activeFields = Object.keys(criteria) as Extract<keyof T, string>[];

    if (activeFields.length === 0) {
      return data;
    }

    return data.filter((item) => {
      // A row must satisfy ALL active criteria fields (AND logic)
      return activeFields.every((field) => {
        const selectedOptions = criteria[field];
        const itemValue = (item as any)[field];

        if (selectedOptions.length === 0) {
          return true; // No selection means the criteria is inactive
        }

        // Format item value to string for comparison (handling booleans)
        const itemStringValue =
          typeof itemValue === 'boolean'
            ? itemValue
              ? 'Yes'
              : 'No'
            : String(itemValue);

        // Check if the item's value is present in the list of selected options (OR logic)
        return selectedOptions.includes(itemStringValue);
      });
    });
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
