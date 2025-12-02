import {
  Component,
  computed,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FlightList } from '../flight-list/flight-list';
import {
  RowContext,
  TableColumn,
  TableIcon,
  TableTooltip,
} from '../flight-list/model';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
// Example Data Model
interface Flight {
  flightNo: string;
  origin: string;
  destination: string;
  price: number;
  departureDate: Date;
  status: 'DELAYED' | 'ON TIME' | 'CANCELLED';
}

@Component({
  selector: 'app-view-comp',
  imports: [FlightList, MatMenuModule, MatIconModule],
  templateUrl: './view-comp.html',
  styleUrl: './view-comp.scss',
})
export class ViewComp {
  // 2. Signal ViewChild: Capture the custom TemplateRef using the strongly-typed context
  private actionsBlockRef =
    viewChild.required<TemplateRef<RowContext<Flight>>>('actionsBlock');

  // 3. Signal for Table Data
  myFlights = signal<Flight[]>([
    {
      flightNo: 'AI-202',
      origin: 'NY',
      destination: 'LDN',
      price: 500,
      departureDate: new Date(2025, 11, 10, 8, 30),
      status: 'ON TIME',
    },
    {
      flightNo: 'BA-112',
      origin: 'LDN',
      destination: 'PAR',
      price: 120,
      departureDate: new Date(2025, 11, 10, 14, 0),
      status: 'DELAYED',
    },
    {
      flightNo: 'QF-001',
      origin: 'SYD',
      destination: 'DXB',
      price: 900,
      departureDate: new Date(2025, 11, 11, 6, 0),
      status: 'ON TIME',
    },
  ]);

  // 4. Computed Signal for Column Configuration
  myTableConfig = computed<TableColumn<Flight>[]>(() => [
    {
      field: 'flightNo',
      label: 'Flight #',
      type: 'text',
      sticky: true,
      alignment: 'center',
      positionIndex: 0,
    },
    {
      field: 'status',
      label: 'Status',
      type: 'icon',
      alignment: 'center',
      icon: {
        name: (item: Flight) =>
          item.status === 'DELAYED' ? 'warning' : 'check_circle',
        color: (item: Flight) =>
          item.status === 'DELAYED' ? 'warn' : 'primary',
      } as TableIcon<Flight>,
      positionIndex: 1,
    },
    {
      field: 'departureDate',
      label: 'Date',
      type: 'date',
      dateFormat: 'MMM d, y, h:mm a',
      isDefaultVisible: false,
      positionIndex: 3,
    },
    {
      field: 'price',
      label: 'Cost ($)',
      type: 'text',
      alignment: 'flex-end',
      cssClass: 'text-bold',
      tooltip: {
        value: (item: Flight) => `Ticket price is $${item.price}`,
        disabled: (item: Flight) => item.price < 500,
      } as TableTooltip<Flight>,
      positionIndex: 2,
    },
    {
      field: 'actions',
      label: 'Actions',
      type: 'button-menu',
      menu: {
        // Pass the captured TemplateRef signal value
        menuBlockReference: this.actionsBlockRef(),
      },
      positionIndex: 4,
    },
  ]);

  // 5. Menu Action Methods
  editFlight(flight: Flight) {
    console.log(`[ACTION] Editing Flight: ${flight.flightNo}`);
  }

  deleteFlight(flight: Flight) {
    console.log(`[ACTION] Deleting Flight: ${flight.flightNo}`);
  }
}
