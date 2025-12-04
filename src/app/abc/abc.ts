import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TableService } from '../lib/table-service';
import { SmartTable } from '../lib/smart-table/smart-table';
import { TableFilter } from '../lib/table-filter/table-filter';
import { ColumnSelect } from '../lib/column-select/column-select';
import { ColumnState } from '../lib/table-state';

// Define the specific type T (User/Item/Product)
interface GenericItem {
  id: number;
  name: string;
  department: string;
  salary: number;
  isExternal: boolean;
}

@Component({
  selector: 'app-abc',
  standalone: true,
  imports: [SmartTable, TableFilter, ColumnSelect, MatCardModule],
  templateUrl: './abc.html',
  styleUrl: './abc.scss',
  providers: [{ provide: TableService, useClass: TableService }],
})
export class Abc implements OnInit {
  // 1. Define the full list of column keys
  readonly displayedColumns: string[] = [
    'id',
    'name',
    'city',
    'progress',
    'isActive',
  ];

  // 1. Define the full column configuration
  readonly columnsConfig: ColumnState<GenericItem>[] = [
    {
      field: 'id',
      label: 'Employee ID',
      type: 'number',
      sticky: true,
      alignment: 'center',
    },
    {
      field: 'name',
      label: 'Employee Name',
      type: 'text',
      cssClasses: 'font-bold',
    },
    { field: 'department', label: 'Department', type: 'text' },
    {
      field: 'salary',
      label: 'Annual Salary',
      type: 'number',
      alignment: 'flex-end',
      // Custom formatter example
      formatter: (data) => `$${data.salary.toLocaleString()}`,
    },
    {
      field: 'isExternal',
      label: 'External',
      type: 'boolean',
      alignment: 'center',
      visible: false,
    },
    {
      // Note: The field name here is arbitrary as no data is displayed, but must be unique.
      field: 'rowMenu' as keyof GenericItem,
      label: 'Options',
      type: 'menu',
      sticky: true, // Stick the menu to the right side
      alignment: 'center',
      menuItems: [
        {
          label: 'Promote',
          icon: 'trending_up',
          action: (item) => this.promoteEmployee(item),
          // Disable promotion for employees already earning over $130k
          disabled: (item) => item.salary > 130000,
        },
        {
          label: 'View Profile',
          icon: 'person',
          action: (item) => this.viewProfile(item),
        },
      ],
    },
  ];

  // 2. Sample Data
  readonly tableData: GenericItem[] = [
    {
      id: 101,
      name: 'Ava Johnson',
      department: 'Engineering',
      salary: 120000,
      isExternal: false,
    },
    {
      id: 102,
      name: 'Ben Smith',
      department: 'Sales',
      salary: 95000,
      isExternal: false,
    },
    {
      id: 103,
      name: 'Cathy Lee',
      department: 'HR',
      salary: 70000,
      isExternal: true,
    },
    {
      id: 104,
      name: 'David Brown',
      department: 'Engineering',
      salary: 140000,
      isExternal: false,
    },
    {
      id: 105,
      name: 'Eva Green',
      department: 'Marketing',
      salary: 85000,
      isExternal: true,
    },
  ];

  // Extract all field names for filter/select components
  readonly columnFieldNames = this.columnsConfig.map((c) => c.field);

  // Inject the service using the specific type
  private readonly tableService = inject(TableService<GenericItem>);

  // Action handlers for the custom menu
  promoteEmployee(item: GenericItem): void {
    // Demonstrating the action execution from the row menu
    console.log(
      `ACTION EXECUTED: Promoted ${item.name}. Salary update pending.`
    );
    // A real application would typically use a custom modal here, but for demonstration, we log the action.
  }

  viewProfile(item: GenericItem): void {
    console.log(
      `ACTION EXECUTED: Viewing profile for ${item.name} (ID: ${item.id}).`
    );
  }

  ngOnInit(): void {
    // Pass the full configuration to the service
    this.tableService.setInitialConfig(
      this.tableData,
      this.columnsConfig,
      'id', // Identifier field
      3
    );
  }
}
