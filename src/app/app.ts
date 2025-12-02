import { Component, signal } from '@angular/core';
import { ViewComp } from './view-comp/view-comp';

@Component({
  selector: 'app-root',
  imports: [ViewComp],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('sample');
}
