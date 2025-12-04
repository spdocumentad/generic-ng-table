import { Component, computed, inject, input, OnInit } from '@angular/core';
import { TableService } from '../table-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * Interface for the field configuration passed into the component.
 * We now strictly type 'field' as a key of T to resolve the indexing error 7053.
 */
interface FilterField<T extends object> {
  field: Extract<keyof T, string>; // Strictly typed key
  label: string;
}

@Component({
  selector: 'app-select-filter',
  imports: [MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './select-filter.html',
  styleUrl: './select-filter.scss',
})
export class SelectFilter<T extends object> implements OnInit {
  private tableService = inject(TableService<T>);

  filterFields = input<FilterField<T>[]>([]);

  // Expose the available filter options signal from the service
  availableOptions = computed(
    () => this.tableService.state().availableFilterOptions
  );

  // Store the form controls dynamically, now using string | null for single select
  filterControls: Record<string, FormControl<string | null>> = {};

  ngOnInit(): void {
    // Initialize a FormControl for each input filter field
    this.filterFields().forEach((config) => {
      // Initialize with null for single selection (representing 'All')
      const control = new FormControl<string | null>(null);
      this.filterControls[config.field] = control;

      // Subscribe to value changes and update the service filter
      control.valueChanges.subscribe((selectedValue) => {
        // Convert the single selected value (string or null) into the string[] array
        // format that the TableService expects.
        const filterArray = selectedValue === null ? [] : [selectedValue];

        // Pass the field name and the selected array to the service
        this.tableService.updateCriteriaFilter(
          config.field as Extract<keyof T, string>,
          filterArray
        );
      });
    });
  }

  // Updated type signature for the getter
  getControl(field: string): FormControl<string | null> {
    return this.filterControls[field];
  }
}
