import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'terse-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  host: {
    'class': 'contents',
  },
})
export class App {}
