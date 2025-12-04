import { Component, signal } from '@angular/core';
import { Abc } from './abc/abc';

@Component({
  selector: 'app-root',
  imports: [Abc],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('sample');
}
