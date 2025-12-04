import { Component, computed, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TableService } from '../table-service';

@Component({
  selector: 'app-table-filter',
  imports: [MatFormFieldModule, MatInputModule, MatIcon],
  templateUrl: './table-filter.html',
  styleUrl: './table-filter.scss',
})
export class TableFilter<T extends object> {
  // Use Angular's `inject` function to get the correct TableService instance.
  // When AbcComponent provides TableService<GenericItem>, this component receives TableService<GenericItem>.
  private tableService = inject(TableService<T>);

  // Get the filter value directly from the service state Signal
  filterValue = computed(() => this.tableService.state().filter);

  onFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableService.updateFilter(filterValue.trim().toLowerCase());
  }
}
