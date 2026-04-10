import {Component} from '@angular/core';
import {TerseButton} from './components/ui/terse-button';
import {
  TerseCard,
  TerseCardAction,
  TerseCardContent,
  TerseCardDescription,
  TerseCardHeader,
  TerseCardTitle,
} from './components/ui/terse-card';
import {TerseMenu, TerseMenuItem, TerseMenuTrigger} from './components/ui/terse-menu';

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
            <button terseButton="outline" terseFocus [terseMenuTrigger]="animals">
              This is a menu
            </button>

            <ng-template #animals>
              <terse-menu>
                <button terseMenuItem [terseMenuTrigger]="vertebrates">Vertebrates</button>
                <button terseMenuItem [terseMenuTrigger]="invertebrates">Invertebrates</button>
              </terse-menu>
            </ng-template>

            <ng-template #vertebrates>
              <terse-menu side="right span-bottom">
                <button terseMenuItem>Fish</button>
                <button terseMenuItem>Amphibians</button>
                <button terseMenuItem>Reptiles</button>
                <button terseMenuItem>Birds</button>
                <button terseMenuItem>Mammals</button>
              </terse-menu>
            </ng-template>

            <ng-template #invertebrates>
              <terse-menu side="right span-bottom">
                <button terseMenuItem>Insects</button>
                <button terseMenuItem>Molluscs</button>
                <button terseMenuItem [terseMenuTrigger]="vertebrates2">Crustaceans</button>
              </terse-menu>
            </ng-template>

            <ng-template #vertebrates2>
              <terse-menu side="right span-bottom">
                <button terseMenuItem>Fish</button>
                <button terseMenuItem>Amphibians</button>
                <button terseMenuItem>Reptiles</button>
                <button terseMenuItem>Birds</button>
                <button terseMenuItem>Mammals</button>
              </terse-menu>
            </ng-template>

            <ng-template #invertebrates2>
              <terse-menu side="right span-bottom">
                <button terseMenuItem>Insects</button>
                <button terseMenuItem>Molluscs</button>
                <button terseMenuItem>Crustaceans</button>
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
