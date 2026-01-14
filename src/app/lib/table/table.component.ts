import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// import { NotificationService } from 'src/app/services/notification.service';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { MenuRecursiveComponent } from '../menu-recursive/menu-recursive.component';
import {
  ColumnState,
  MenuItem,
  SelectionExport,
  ToggleResult,
} from '../table-state';
import { TableService } from '../table.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    IconButtonComponent,
    IconComponent,
    MenuRecursiveComponent,
    NgClass,
    CdkContextMenuTrigger,
    CdkMenu,
    // CdkMenuItem,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends object> implements AfterViewInit {
  private readonly tableService = inject(TableService<T>);
  // private readonly notifyService = inject(NotificationService);

  // ViewChild for Material Sort
  readonly matSort = viewChild(MatSort);

  // 1. Core State & Data
  readonly state = this.tableService.state; // The unified TableState<T>
  readonly tableData = this.tableService.visibleData; // Filtered/Sorted rows

  // 2. Column Configurations
  readonly allColumnsConfig = computed(() => this.state().columns);

  // Computed config for visible columns (used for MatTable headers and row definitions)
  readonly visibleColumnConfig = computed(() => {
    const s = this.state();
    const visibleColumns = s.columns.filter(
      (col) => s.columnVisibility[col.field]
    );
    return {
      columns: visibleColumns,
      fields: visibleColumns.map((col) => col.field),
    };
  });

  // 3. Selection Derived Signals
  readonly selectedRows = computed(() => this.state().selection.selectedRows);
  readonly currentSelection = computed(
    () => this.state().selection.currentSelection
  );
  readonly identifierKey = computed(() => this.state().identifier);
  readonly maxSelectionLimit = computed(
    () => this.state().selection.maxSelectionLimit
  );

  // 4. Outputs
  readonly rowSelectionChanged = output<SelectionExport<T>>();

  ngAfterViewInit(): void {
    const sort = this.matSort();
    if (sort) {
      sort.sortChange.subscribe((sortEvent: Sort) => {
        this.tableService.updateSort(
          sortEvent.active as Extract<keyof T, string>,
          sortEvent.direction
        );
      });
    }
  }

  // --- Logic Handlers ---

  onRowClick(row: T, event?: MouseEvent): void {
    // If the click originated from an interactive element (like a button or checkbox),
    // we let that component handle its own logic and skip row selection.
    const target = event?.target as HTMLElement;
    if (target?.closest('button') || target?.closest('.mat-mdc-menu-trigger')) {
      return;
    }
    const toggleResult = this.tableService.toggleRowSelection(row);

    if (toggleResult === 'limitReached') {
      // this.notifyService.notifyTechInfo(
      //   'Selection Limit',
      //   `You can only select up to ${this.maxSelectionLimit()} items.`,
      //   4000
      // );
    } else {
      this.rowSelectionChanged.emit({
        selectedRows: this.selectedRows(),
        toggleState: toggleResult,
        currentSelection: this.currentSelection(),
      });
    }
  }

  onContextMenu(row: T): void {
    // const idKey = this.identifierKey();
    // const current = this.currentSelection();
    // // Only trigger a selection change if right-clicking a row not already "active"
    // if (!current || (row as any)[idKey] !== (current as any)[idKey]) {
    //   this.onRowClick(row);
    // }
  }

  isRowSelected(row: T): boolean {
    const idKey = this.identifierKey();
    const selected = this.selectedRows();
    return selected.some(
      (item) => (item as any)[idKey] === (row as any)[idKey]
    );
  }

  executeAction(row: T, item: MenuItem<T>): void {
    if (item.action) {
      item.action(row);
    }
  }

  // --- Formatting Helpers ---

  getCellValue(element: T, col: ColumnState<T>): string {
    const value = (element as any)[col.field];

    if (value === null || value === undefined || value === '') {
      return col.type === 'date' ? '-:-' : '--';
    }

    if (col.formatter) {
      return col.formatter(element);
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  }

  getMenuButtonConfig(col: ColumnState<T>) {
    return {
      name: col.menuItems?.icon ?? 'more_vert',
      isEnabled: true,
      isSvg: false,
    };
  }

  /**
   * Stop Propagation Helper
   * Used in the template to prevent clicks on menus from bubbling up to the row.
   */
  handleActionClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
