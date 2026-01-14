import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ColumnState, MenuItem, SelectionExport } from '../lib/table-state';
import { MatExpansionModule } from '@angular/material/expansion';
import { TableFilterComponent } from '../lib/table-filter/table-filter.component';
import { SelectFilterComponent } from '../lib/select-filter/select-filter.component';
import { ColumnFilterComponent } from '../lib/column-filter/column-filter.component';
import { TableComponent } from '../lib/table/table.component';
import { TableService } from '../lib/table.service';

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
  imports: [
    TableFilterComponent,
    SelectFilterComponent,
    ColumnFilterComponent,
    TableComponent,
    MatCardModule,
    MatExpansionModule,
  ],
  templateUrl: './abc.html',
  styleUrl: './abc.scss',
  providers: [{ provide: TableService, useClass: TableService }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Abc implements OnInit {
  // Inject the service using the specific type
  private readonly tableService = inject(TableService<GenericItem>);
  readonly panelOpenState = signal(true);
  // Configuration for filtering logic
  readonly criteriaFilterFields = [
    { field: 'department', label: 'Filter by Department' },
  ];

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
    {
      field: 'department',
      label: 'Department',
      type: 'text',
      filterableByCriteria: true,
    },
    {
      field: 'salary',
      label: 'Annual Salary',
      type: 'number',
      alignment: 'flex-end',
      formatter: (data) => `$${data.salary.toLocaleString()}`,
    },
    {
      field: 'isExternal',
      label: 'External',
      type: 'boolean',
      alignment: 'center',
      visible: false,
      filterableByCriteria: true,
    },
    {
      field: 'rowMenu' as keyof GenericItem,
      label: 'Options',
      type: 'menu',
      sticky: true,
      alignment: 'center',
      menuItems: {
        showOnHover: true,
        icon: 'more_vert',
        menu: [
          {
            label: 'Promote Employee',
            icon: 'more_vert',
            // Action execution
            action: (item) => this.promoteEmployee(item),
            // Logic: Only Engineering & Sales can be promoted, and only if salary < 130k
            disabled: (item) =>
              !['Engineering', 'Sales'].includes(item.department) ||
              item.salary > 130000,
          },
          {
            label: 'Management Actions',
            icon: 'more_vert',
            children: [
              {
                label: 'Transfer Department',
                icon: 'move_down',
                action: (item) => console.log('Transferring', item.name),
              },
              {
                label: 'Terminate Contract',
                icon: 'more_vert',
                action: (item) => console.warn('Terminating', item.name),
                // Logic: Cannot terminate if they are already External (Contractors)
                disabled: (item) => item.isExternal,
              },
            ],
          },
          {
            label: 'View Full Profile',
            icon: 'more_vert',
            action: (item) => this.viewProfile(item),
          },
        ],
      },
    },
  ];

  // inside class Abc
  readonly contextMenuConfig: MenuItem<GenericItem>[] = [
    {
      label: 'Quick Action: Copy ID',
      icon: 'content_copy',
      action: (item) => {
        navigator.clipboard.writeText(item.id.toString());
        console.log(`Copied ID: ${item.id}`);
      },
    },
    {
      label: 'Send Notification',
      icon: 'notifications_active',
      action: (item) => console.log(`Sending ping to ${item.name}...`),
      // Disable if salary is too high (logic example)
      disabled: (item) => item.salary > 130000,
    },
    {
      label: 'Employee Logistics',
      icon: 'local_shipping',
      children: [
        {
          label: 'Assign Equipment',
          icon: 'computer',
          action: (item) => console.log(`Assigning laptop to ${item.name}`),
        },
        {
          label: 'Request Badge',
          icon: 'badge',
          action: (item) => console.log(`Badge request for ${item.id}`),
          // Only available for External contractors
          disabled: (item) => !item.isExternal,
        },
      ],
    },
    {
      label: 'Delete Record',
      icon: 'delete_forever',
      action: (item) => console.error(`Deleting ${item.name}...`),
    },
  ];

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
    {
      id: 106,
      name: 'Frank Miller',
      department: 'Sales',
      salary: 110000,
      isExternal: false,
    },
    {
      id: 107,
      name: 'Grace Hall',
      department: 'Engineering',
      salary: 135000,
      isExternal: false,
    },
  ];

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
    // 3. Initialize the state via the service
    // We pass the data, config, and set the pagination/selection defaults
    this.tableService.setInitialConfig({
      id: 'employee-table',
      data: this.tableData,
      columns: this.columnsConfig,
      identifier: 'id',
      multiSelect: true,
      maxSelectionLimit: 5,
      rowContextMenu: this.contextMenuConfig,
    });
  }

  onRowSelectionChanged(data: SelectionExport<GenericItem>): void {
    console.log(data);
  }
}
