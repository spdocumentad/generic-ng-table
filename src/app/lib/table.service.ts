import { computed, Injectable, signal } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { ColumnState, MenuItem, TableState, ToggleResult } from './table-state';

// Make the service generic with type T for the data payload
@Injectable({
  providedIn: 'root',
})
export class TableService<T> {
  // 1. Unified State Signal
  private readonly _state = signal<TableState<T>>({
    id: 'default-table',
    loading: false,
    data: [],
    columns: [],
    identifier: 'id' as keyof T,
    sortable: true,
    sort: { key: null, direction: '' },
    globalFilter: '',
    criteriaFilters: {} as Record<Extract<keyof T, string>, string[]>,
    availableFilterOptions: {} as Record<Extract<keyof T, string>, string[]>,
    columnVisibility: {},
    selection: {
      selectedRows: [],
      currentSelection: null,
      multiSelect: false,
      maxSelectionLimit: undefined,
    },
  });

  // Public Readonly State for Components
  public readonly state = this._state.asReadonly();

  // --- Computed Selectors ---

  /** 1. Filter the raw data based on global and criteria filters */
  private readonly filteredData = computed(() => {
    const s = this._state();
    let data = [...s.data];

    if (s.globalFilter) {
      data = this.applyGlobalFilter(data, s.globalFilter, s.columns);
    }

    return this.applyCriteriaFilters(data, s.criteriaFilters);
  });

  /** 2. Sort the filtered data (This is the final data for the table) */
  public readonly visibleData = computed(() => {
    const s = this._state();
    const data = this.filteredData();

    if (!s.sort.key || !s.sort.direction) return data;

    return this.applySort(
      [...data],
      s.sort as { key: Extract<keyof T, string>; direction: SortDirection }
    );
  });

  /**
   * Sets the initial configuration and data for the table.
   * @param data The array of data objects.
   * @param columns The full column configuration.
   * @param identifier The key property used to identify a row.
   * @param maxSelectionLimit Optional limit for multi-selection.
   */
  setInitialConfig(config: {
    id?: string;
    data: T[];
    columns: ColumnState<T>[];
    identifier: keyof T;
    multiSelect?: boolean;
    maxSelectionLimit?: number;
    rowContextMenu?: MenuItem<T>[];
  }): void {
    const initialVisibility: Record<string, boolean> = {};
    config.columns.forEach((col) => {
      initialVisibility[col.field as string] = col.visible !== false;
    });

    const filterOptions = this.deriveAvailableFilterOptions(
      config.data,
      config.columns
    );

    this._state.update((s) => ({
      ...s,
      id: config.id || s.id,
      data: config.data,
      columns: config.columns,
      identifier: config.identifier,
      columnVisibility: initialVisibility,
      availableFilterOptions: filterOptions,
      rowContextMenu: config.rowContextMenu,
      selection: {
        ...s.selection,
        multiSelect: !!config.multiSelect,
        maxSelectionLimit: config.maxSelectionLimit,
      },
    }));
  }

  setLoading(isLoading: boolean): void {
    this._state.update((s) => ({ ...s, loading: isLoading }));
  }

  updateSort(key: Extract<keyof T, string>, direction: SortDirection): void {
    this._state.update((s) => ({ ...s, sort: { key, direction } }));
  }

  updateGlobalFilter(val: string): void {
    this._state.update((s) => ({ ...s, globalFilter: val }));
  }

  updateCriteriaFilter(
    field: Extract<keyof T, string>,
    selectedValues: string[]
  ): void {
    this._state.update((s) => {
      const newCriteria = { ...s.criteriaFilters };
      if (selectedValues.length > 0) {
        newCriteria[field] = selectedValues;
      } else {
        delete newCriteria[field];
      }
      return { ...s, criteriaFilters: newCriteria };
    });
  }

  toggleRowSelection(row: T): ToggleResult {
    const s = this._state();
    const idKey = s.identifier;
    const selected = [...s.selection.selectedRows];
    const index = selected.findIndex((r) => r[idKey] === row[idKey]);

    if (index !== -1) {
      const newSelected = selected.filter((_, i) => i !== index);
      this.patchSelection(newSelected, row);
      return 'deselected';
    }

    if (
      s.selection.maxSelectionLimit &&
      selected.length >= s.selection.maxSelectionLimit
    ) {
      return 'limitReached';
    }

    const newSelected = s.selection.multiSelect ? [...selected, row] : [row];
    this.patchSelection(newSelected, row);
    return 'selected';
  }

  /**
   * Toggles the visibility of a specific column.
   * @param columnId The field name of the column to toggle.
   * @param isVisible The target visibility state.
   */
  toggleColumn(columnId: string, isVisible: boolean): void {
    this._state.update((s) => ({
      ...s,
      columnVisibility: {
        ...s.columnVisibility,
        [columnId]: isVisible,
      },
    }));
  }

  private patchSelection(rows: T[], current: T): void {
    this._state.update((s) => ({
      ...s,
      selection: {
        ...s.selection,
        selectedRows: rows,
        currentSelection: current,
      },
    }));
  }

  // --- Internal Processing Helpers ---

  private applyGlobalFilter(
    data: T[],
    query: string,
    columns: ColumnState<T>[]
  ): T[] {
    const searchableFields = columns
      .filter((c) => c.searchable !== false)
      .map((c) => c.field);
    const q = query.toLowerCase();
    return data.filter((item) =>
      searchableFields.some((f) =>
        String((item as any)[f])
          .toLowerCase()
          .includes(q)
      )
    );
  }

  private applyCriteriaFilters(
    data: T[],
    criteria: Record<string, string[]>
  ): T[] {
    const activeFields = Object.keys(criteria) as (keyof T)[];
    if (activeFields.length === 0) return data;

    return data.filter((item) =>
      activeFields.every((field) => {
        const selected = criteria[field as string];
        return (
          selected.length === 0 ||
          selected.includes(this.normalizeValue(item[field]))
        );
      })
    );
  }

  private applySort(
    data: T[],
    sort: { key: Extract<keyof T, string>; direction: SortDirection }
  ): T[] {
    const mult = sort.direction === 'asc' ? 1 : -1;
    return data.sort((a, b) => {
      const aV = a[sort.key];
      const bV = b[sort.key];
      return aV < bV ? -1 * mult : aV > bV ? 1 * mult : 0;
    });
  }

  private deriveAvailableFilterOptions(
    data: T[],
    columns: ColumnState<T>[]
  ): Record<Extract<keyof T, string>, string[]> {
    const options = {} as any;
    columns
      .filter((c) => c.filterableByCriteria)
      .forEach((col) => {
        const unique = new Set(
          data.map((item) => this.normalizeValue(item[col.field as keyof T]))
        );
        options[col.field] = Array.from(unique).sort();
      });
    return options;
  }

  private normalizeValue(value: any): string {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value != null ? String(value) : '';
  }
}
