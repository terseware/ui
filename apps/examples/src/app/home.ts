import {Component} from '@angular/core';
import {TerseButton} from './components/ui/button';
import {
  TerseCard,
  TerseCardAction,
  TerseCardContent,
  TerseCardDescription,
  TerseCardHeader,
  TerseCardTitle,
} from './components/ui/card';
import {TerseMenu, TerseMenuItem, TerseMenuTrigger} from './components/ui/menu';

@Component({
  selector: 'terse-home',
  imports: [
    TerseMenuTrigger,
    TerseMenu,
    TerseMenuItem,
    TerseButton,
    TerseCard,
    TerseCardTitle,
    TerseCardContent,
    TerseCardHeader,
    TerseCardDescription,
    TerseCardAction,
  ],
  host: {
    'class': 'contents',
  },
  template: `
    <div class="flex flex-col gap-4 p-4">
      <terse-card class="w-full max-w-sm">
        <terse-card-header>
          <h1 terseCardTitle>This is a header</h1>
          <p terseCardDescription>This is a description</p>
          <terse-card-action>
            <button terseButton="outline" [terseMenuTrigger]="menu">This is a menu</button>
            <ng-template #menu>
              <terse-menu>
                <button terseMenuItem>Menu Item 1</button>
                <button terseMenuItem>Menu Item 2</button>
                <button terseMenuItem>Menu Item 3</button>
                <button terseMenuItem>Menu Item 4</button>
              </terse-menu>
            </ng-template>
          </terse-card-action>
        </terse-card-header>
        <terse-card-content> hi </terse-card-content>
      </terse-card>
    </div>
  `,
})
export class Home {}
