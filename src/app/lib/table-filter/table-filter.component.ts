import {
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TableService } from '../table.service';
import { FormsModule } from '@angular/forms';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'app-table-filter',
  imports: [MatFormFieldModule, FormsModule, IconButtonComponent],
  templateUrl: './table-filter.component.html',
  styleUrl: './table-filter.component.scss',
})
export class TableFilterComponent<T extends object> {
  // Use Angular's `inject` function to get the correct TableService instance.
  // When AbcComponent provides TableService<GenericItem>, this component receives TableService<GenericItem>.
  private tableService = inject(TableService<T>);

  // Get the filter value directly from the service state Signal
  filterValue = computed(() => this.tableService.state().globalFilter);

  onFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableService.updateGlobalFilter(filterValue.trim().toLowerCase());
  }

  /**
   * used to focus the input field when clicking the icon
   */
  filter = viewChild<ElementRef>('filter');
  /**
   * used to not play animation on first loading
   */
  isFirstOpen: boolean = true;
  /**
   *  is the filter shown
   */
  isShowFilter: boolean = false;

  ngOnInit(): void {
    // open filter if not empty
    this.filterValue() && this.showFilter();
  }

  /**
   * Avoid to open/close accordion on click
   */
  stopPropagation(event?: Event) {
    event?.stopPropagation();
  }

  showFilter(event?: Event) {
    this.stopPropagation(event);
    if (this.isFirstOpen) {
      this.isFirstOpen = false;
    }
    this.isShowFilter = !this.isShowFilter;
    // if (this.isShowFilter) {
    //   this.filter().nativeElement.focus();
    // }
    if (!this.isShowFilter) {
      this.tableService.updateGlobalFilter('');
    }
  }
}
