import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MenuItem } from '../table-state';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu-recursive',
  standalone: true, // Standard for modern Angular
  imports: [MatMenuModule, MatIconModule],
  templateUrl: './menu-recursive.component.html',
  styleUrl: './menu-recursive.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimized for Signals
})
export class MenuRecursiveComponent<T> {
  // Use a fallback empty array to solve the 'undefined' error from earlier
  items = input<MenuItem<T>[]>([]);
  rowData = input.required<T>();

  /**
   * Helper to handle both static and functional disabled states
   */
  isItemDisabled(item: MenuItem<T>): boolean {
    const disabled = item.disabled;
    const data = this.rowData();

    if (typeof disabled === 'function') {
      return disabled(data);
    }
    return !!disabled;
  }

  /**
   * Executes the item action with the current row data
   */
  handleAction(item: MenuItem<T>): void {
    if (item.action) {
      item.action(this.rowData());
    }
  }

  // NOTE: If you find mat-menu's default hover behavior sufficient,
  // you can remove the manual onMouseEnter/Leave logic entirely.
  // Material handles sub-menu triggers natively.
}
