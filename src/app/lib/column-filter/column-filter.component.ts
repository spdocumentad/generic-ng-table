import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { TableService } from '../table.service';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'app-column-filter',
  standalone: true,
  imports: [MatMenuModule, MatCheckboxModule, IconButtonComponent],
  templateUrl: './column-filter.component.html',
  styleUrl: './column-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnFilterComponent<T extends object> {
  private readonly tableService = inject(TableService<T>);

  /**
   * Computed signal that maps all available columns to their current visibility.
   * This reacts automatically whenever the table state changes.
   */
  readonly columnData = computed(() => {
    const s = this.tableService.state();
    return s.columns.map((col) => ({
      field: col.field as string,
      label: col.label,
      // Default to true if the field isn't explicitly in the visibility map
      isVisible: s.columnVisibility[col.field as string] !== false,
    }));
  });

  /**
   * Updates the visibility of a specific column in the global state.
   */
  onToggle(columnId: string, isChecked: boolean): void {
    this.tableService.toggleColumn(columnId, isChecked);
  }

  /**
   * Prevents the MatMenu from closing when a user clicks inside the list.
   */
  onStopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
