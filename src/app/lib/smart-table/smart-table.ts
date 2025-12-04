import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TableService } from '../table-service';
import { ColumnState } from '../table-state';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-smart-table',
  imports: [MatTableModule, MatSortModule, NgClass, MatTooltipModule, MatIcon],
  templateUrl: './smart-table.html',
  styleUrl: './smart-table.scss',
})
export class SmartTable<T extends object> implements AfterViewInit {
  readonly sort = viewChild.required(MatSort);
  private tableService = inject(TableService<T>);

  // Local state for user feedback (simple modal/message box replacement)
  message = signal<{ text: string; type: 'error' | 'info' } | null>(null);

  // Data signals
  tableData = this.tableService.tableData;
  sortState = computed(() => this.tableService.state().sort);

  // Selection signals
  // Updated to selectedRows to handle the array state
  selectedRows = computed(() => this.tableService.state().selectedRows);
  identifierKey = computed(() => this.tableService.state().identifier);
  // NEW: Get the max selection limit from the service state
  maxSelectionLimit = computed(
    () => this.tableService.state().maxSelectionLimit
  );

  // Configuration signals
  allColumnsConfig = computed(() => this.tableService.state().columns);

  // Computed Signal for the list of FIELD NAMES currently visible, used by *matHeaderRowDef
  visibleColumnFields = computed(() => {
    const state = this.tableService.state();
    const visibility = state.columnVisibility;

    // Filter the full column configuration based on visibility map, then extract only the field name
    return state.columns
      .filter((col) => visibility[col.field])
      .map((col) => col.field);
  });

  // Computed Signal for the full configuration of visible columns, used to render headers/cells
  visibleColumnsConfig = computed<ColumnState<T>[]>(() => {
    const state = this.tableService.state();
    const visibility = state.columnVisibility;

    return state.columns.filter((col) => visibility[col.field]);
  });

  ngAfterViewInit(): void {
    if (this.sort) {
      // NOTE: We need to cast the active key to string for the updateSort method in the service
      this.sort().sortChange.subscribe((sortEvent: Sort) => {
        this.tableService.updateSort(
          sortEvent.active as Extract<keyof T, string>,
          sortEvent.direction
        );
      });
    }
  }

  // Helper to get the value for a cell, applying the formatter if present
  getCellValue(element: T, col: ColumnState<T>): string {
    if (col.formatter) {
      return col.formatter(element);
    }
    // Access the property dynamically
    return (element as any)[col.field];
  }

  // Row click handler
  onRowClick(row: T): void {
    this.clearMessage();
    // toggleRowSelection returns true if successful (selected or deselected), false if limit was hit (only on select)
    const success = this.tableService.toggleRowSelection(row);

    if (!success) {
      const limit = this.maxSelectionLimit();
      this.message.set({
        text: `Selection limit reached! You can select a maximum of ${limit} rows.`,
        type: 'error',
      });

      // Auto-clear message after 5 seconds
      setTimeout(() => this.clearMessage(), 5000);
    }
  }

  /**
   * Clears the floating message.
   */
  clearMessage(): void {
    this.message.set(null);
  }

  /**
   * Check if a row is currently selected for highlighting by checking the selectedRows array.
   */
  isRowSelected(row: T): boolean {
    const selectedRows = this.selectedRows();
    const identifier = this.identifierKey();

    if (!identifier || selectedRows.length === 0) {
      return false;
    }

    const rowIdentifierValue = (row as any)[identifier];

    // Use Array.prototype.some to check for the presence of the row's identifier in the array
    return selectedRows.some(
      (selectedRow) => (selectedRow as any)[identifier] === rowIdentifierValue
    );
  }
}
