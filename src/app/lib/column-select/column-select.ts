import { Component, computed, inject, input } from '@angular/core';
import { TableService } from '../table-service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-column-select',
  imports: [MatMenu, MatMenuTrigger, MatIcon, MatCheckbox],
  templateUrl: './column-select.html',
  styleUrl: './column-select.scss',
})
export class ColumnSelect<T extends object> {
  // Inject the service using the generic type T
  private tableService = inject(TableService<T>);

  // Computed Signal combining configured columns with their current visibility
  columnData = computed(() => {
    const state = this.tableService.state();
    const visibility = state.columnVisibility;

    return state.columns.map((col) => ({
      field: col.field,
      label: col.label,
      isVisible: visibility[col.field] ?? true, // Default to true if not in map
    }));
  });

  onToggle(columnId: string, event: { checked: boolean }): void {
    this.tableService.toggleColumn(columnId, event.checked);
  }
}
