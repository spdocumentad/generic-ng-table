import { SortDirection } from '@angular/material/sort';

export interface TableState<T> {
  // Global table identifier (useful if multiple tables use the same service)
  id: string;

  data: T[]; // The raw data
  columns: ColumnState<T>[]; // Full configuration of all columns
  identifier: keyof T; // Key to uniquely identify a row (e.g., 'id')
  sortable?: boolean; // Global sort control

  sort: {
    key: Extract<keyof T, string>;
    direction: SortDirection;
  };
  globalFilter: string; // Global search string
  criteriaFilters: Record<Extract<keyof T, string>, string[]>;
  availableFilterOptions: Record<Extract<keyof T, string>, string[]>;

  columnVisibility: Record<string, boolean>; // e.g., { 'id': true, 'name': false }

  disabled?: boolean;

  multiSelect?: boolean;
  selectedRows: T[]; // Holds the currently selected row data
  maxSelectionLimit?: number; // Max number of rows that can be selected
}

export interface ColumnState<T> {
  field: Extract<keyof T, string>; // The data field name (used for matColumnDef)
  label: string;
  sticky?: boolean;
  sortable?: boolean;
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'date'
    | 'icon'
    | 'button'
    | 'menu'
    | 'custom';
  formatter?: (data: T) => string; // Function to format cell data

  alignment?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';

  cssClasses?: string;
  filterableByCriteria?: boolean;
  menuItems?: MenuItem<T>[];

  tooltip?: Tooltip<T>;

  index?: number; // Optional index for ordering
  visible?: boolean; // Optional default visibility
}

export interface MenuItem<T> {
  label: string;
  action: (data: T) => void;
  icon?: string;
  disabled?: (data: T) => boolean; // Optional function to disable the item based on row data
}

export interface Tooltip<T> {
  content: (data: T) => string;
  position?: 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
  disabled?: (data: T) => boolean;
}
