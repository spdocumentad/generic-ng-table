import { TemplateRef } from '@angular/core';
import { MatMenu } from '@angular/material/menu';

export interface TableColumn<T> {
  field: Extract<keyof T, string> | string;
  label: string;
  sticky?: boolean;
  type: 'text' | 'date' | 'button-menu' | 'icon' | 'icon-button';
  dateFormat?: string;
  alignment?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  cssClass?: string;
  menu?: Partial<TableMenuItem<T>>;
  tooltip?: TableTooltip<T>;
  headerTooltip?: string;
  icon?: TableIcon<T>;
  isDefaultVisible?: boolean;
  positionIndex?: number;
}
export interface TableIcon<T> {
  name: (item: T) => string;
  color?: (item: T) => string;
  isSvg?: boolean;
  onClick?: (item: T) => void;
}

export interface TableMenuItem<T> {
  // Generic TemplateRef used to inject the full MatMenu structure
  menuBlockReference: TemplateRef<RowContext<T>>;
}

export interface TableTooltip<T> {
  value: (item: T) => string;
  position?: 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
  disabled?: (item: T) => boolean;
}

export interface RowContext<T> {
  // This explicit key 'rowItem' is used in the consumer component: let-flight="rowItem"
  rowItem: T;
}
