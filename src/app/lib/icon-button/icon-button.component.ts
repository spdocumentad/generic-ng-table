import { Component, computed, input } from '@angular/core';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { IconComponent } from '../icon/icon.component';
import { CommonModule, NgClass, NgStyle } from '@angular/common';

interface ButtonConfig {
  name: string,
  size: string;

  withHover: boolean;

  isSvg: boolean;

  isEnabled: boolean;

  tooltipText: string;

  tooltipPosition: TooltipPosition;

}

@Component({
  selector: 'app-icon-button',
  imports: [MatTooltipModule, IconComponent, CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  readonly config = input<Partial<ButtonConfig>>({});
  private readonly defaultConfig: ButtonConfig = {
    name: 'done',
    size: '17px',
    isSvg: false,
    isEnabled: true,
    withHover: true,
    tooltipText: '',
    tooltipPosition: 'above'
  }

  readonly resolvedConfig = computed<ButtonConfig>(() => ({
    ...this.defaultConfig,
    ...this.config()
  }));


}
