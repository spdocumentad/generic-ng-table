import { SortDirection } from '@angular/material/sort';

export interface TableState<T> {
  // Global table identifier (useful if multiple tables use the same service)
  id: string;
  loading: boolean;
  data: T[]; // The raw data
  columns: ColumnState<T>[]; // Full configuration of all columns
  identifier: keyof T; // Key to uniquely identify a row (e.g., 'id')
  sortable?: boolean; // Global sort control

  sort: {
    key: Extract<keyof T, string> | null;
    direction: SortDirection;
  };

  globalFilter: string;
  criteriaFilters: Record<Extract<keyof T, string>, string[]>;
  availableFilterOptions: Record<Extract<keyof T, string>, string[]>;
  columnVisibility: Record<string, boolean>;

  selection: TableSelectionState<T>; // Integrated selection into state

  noDataRowMessage?: string;
  rowContextMenu?: MenuItem<T>[];
  expandedRowId?: string | number | null; // Added: Support for expandable rows

  disabled?: boolean;
}

export interface ColumnState<T> {
  field: Extract<keyof T, string>; // The data field name (used for matColumnDef)
  label: string;
  sticky?: boolean;
  sortable?: boolean;
  type: ColumnType;
  formatter?: (data: T) => string; // Function to format cell data

  alignment?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';

  cssClasses?: string;
  filterableByCriteria?: boolean;
  menuItems?: {
    showOnHover?: boolean;
    icon?: string;
    menu: MenuItem<T>[];
  };

  tooltip?: Tooltip<T>;

  index?: number; // Optional index for ordering
  visible?: boolean; // Optional default visibility

  searchable?: boolean;

  headerTooltip?: string;
  dateFormat?: string;
}

export interface MenuItem<T> {
  label: string;
  action?: (data: T) => void;
  icon?: string;
  disabled?: boolean | ((data: T) => boolean);
  children?: MenuItem<T>[];
}

export interface Tooltip<T> {
  content: (data: T) => string;
  position?: 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
  disabled?: (data: T) => boolean;
}

/**
 * Interface for the field configuration passed into the component.
 * We now strictly type 'field' as a key of T to resolve the indexing error 7053.
 */
export interface FilterField<T extends object> {
  field: Extract<keyof T, string>; // Strictly typed key
  label: string;
}

export type ToggleResult = 'selected' | 'deselected' | 'limitReached';

export type ColumnType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'icon'
  | 'button'
  | 'menu'
  | 'custom';

// Selection export
export interface SelectionExport<T> {
  selectedRows: T[];
  toggleState: ToggleResult;
  currentSelection: T | null;
}

export interface TableSelectionState<T> {
  selectedRows: T[];
  currentSelection: T | null;
  multiSelect: boolean;
  maxSelectionLimit?: number;
}
