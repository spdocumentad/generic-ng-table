import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableColumn } from './model';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-flight-list',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './flight-list.html',
  styleUrl: './flight-list.scss',
})
export class FlightList<T> implements AfterViewInit {
  tableData = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>(); // All available columns
  enableSort = input<boolean>(false);
  enableFilter = input<boolean>(false);

  // --- New Signal for Column Control ---
  // Tracks which columns are currently visible (initialized to ALL columns)
  visibleColumnKeys = signal<string[]>([]);

  // --- Updated: Getter for displayed columns ---
  // Filters the fully sorted list based on current visibility status.
  displayedColumns = () => {
    const visibleKeys = new Set(this.visibleColumnKeys());

    // Filter the stable ordered list to only include keys that are currently visible
    return this.orderedColumnKeys().filter((key) => visibleKeys.has(key));
  };

  // --- Internal State ---
  dataSource = new MatTableDataSource<T>();

  // Get reference to MatSort using Signal viewChild
  sort = viewChild(MatSort);

  private orderedColumnKeys = signal<string[]>([]);

  constructor() {
    effect(() => {
      // 1. Calculate the stable, ordered list of all column keys (used for sorting)
      const sortedColumns = this.getOrderedColumn();

      this.orderedColumnKeys.set(
        sortedColumns.map((col) => col.field as string)
      );

      // 2. Set default visible keys (only runs on first column load)
      if (this.visibleColumnKeys().length === 0 && sortedColumns.length > 0) {
        const defaultVisibleKeys = sortedColumns // Use the sorted list for initial visibility
          .filter((col) => col.isDefaultVisible !== false)
          .map((col) => col.field as string);

        // We set the initial visible keys here. They are already in the correct order.
        this.visibleColumnKeys.set(defaultVisibleKeys);
      }

      this.dataSource.data = this.tableData();
    }); // We allow writing to visibleColumnKeys inside this effect

    effect(() => {
      const currentSort = this.sort();
      if (currentSort && this.enableSort()) {
        this.dataSource.sort = currentSort;
        this.dataSource.data = this.tableData();
      } else if (this.dataSource.sort) {
        // Clear sort if disabled
        this.dataSource.sort = null;
      }
    });
  }

  ngAfterViewInit() {
    // 1. Get the MatSort instance from the signal viewChild
    const matSortInstance = this.sort();

    // 2. Only apply if the instance exists AND sorting is enabled
    if (matSortInstance && this.enableSort()) {
      this.dataSource.sort = matSortInstance;
    }
  }

  /**
   * Toggles the visibility of a column key.
   * @param key The column key (e.g., 'flightNo')
   * @param checked The new state (true/false)
   */
  toggleColumn(key: string, checked: boolean) {
    this.visibleColumnKeys.update((currentKeys) => {
      if (checked) {
        // Add the key if checked and not already present
        if (!currentKeys.includes(key)) {
          return [...currentKeys, key];
        }
      } else {
        // Remove the key if unchecked
        return currentKeys.filter((k) => k !== key);
      }
      return currentKeys; // Return current keys if no change
    });
  }

  // Helper to check the current visibility status for the checkbox
  isColumnVisible(key: string): boolean {
    return this.visibleColumnKeys().includes(key);
  }

  applyFilter(event: Event) {
    if (!this.enableFilter()) return;

    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getOrderedColumn() {
    return [...this.columns()].sort(
      (a, b) => (a.positionIndex ?? 0) - (b.positionIndex ?? 0)
    );
  }
}
