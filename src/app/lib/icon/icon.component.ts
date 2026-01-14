import { NgStyle } from '@angular/common';
import {
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  input,
  Input,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
// import { SkyfleetModulesNgxLibService } from 'skyfleet-modules-ngx-lib';

@Component({
  selector: 'app-icon',
  imports: [MatIconModule, MatTooltipModule, NgStyle],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input<string>('done');
  size = input<string>('17px');
  text = input<string>('');
  isSvg = input<boolean>(false);

  public apiUrl: string = '';

  // private readonly skylibService = inject(SkyfleetModulesNgxLibService);
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      if (this.isSvg()) {
        this.loadSvg();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isSvg'] && changes['isSvg'].currentValue) {
      this.loadSvg();
    }
  }

  loadSvg(): void {
    const iconName = this.name(); // Read the signal value
    const baseUrl: string = '';

    // The registry needs a unique name, which is `iconName`
    this.iconRegistry.addSvgIcon(
      iconName,
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${baseUrl}/assets/svg-icons/${iconName}.svg`
      )
    );
  }
}
