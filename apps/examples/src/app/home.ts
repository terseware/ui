import {Component} from '@angular/core';
import {Button} from '@terseware/ui/button';
import {AppButton} from './components/ui/app-button';
import {
  AppCard,
  AppCardAction,
  AppCardContent,
  AppCardDescription,
  AppCardHeader,
  AppCardTitle,
} from './components/ui/app-card';
import {AppMenu, AppMenuItem, AppMenuTrigger} from './components/ui/app-menu';

@Component({
  selector: 'app-home',
  imports: [
    AppMenuTrigger,
    AppMenu,
    AppMenuItem,
    AppButton,
    AppCard,
    AppCardTitle,
    AppCardContent,
    AppCardHeader,
    AppCardDescription,
    AppCardAction,
    Button,
  ],
  host: {
    'class': 'contents',
  },
  template: `
    <div class="flex flex-col gap-4 p-4">
      <div class="p-4">
        <button button (click)="console.log('click')">button</button>
      </div>
      <app-card class="w-full max-w-sm">
        <app-card-header>
          <h1 appCardTitle>This is a header</h1>
          <p appCardDescription>This is a description</p>
          <app-card-action>
            <button appButton="outline" appFocus [appMenuTrigger]="animals">This is a menu</button>

            <ng-template #animals>
              <app-menu>
                <button appMenuItem [appMenuTrigger]="vertebrates">Vertebrates</button>
                <button appMenuItem [appMenuTrigger]="invertebrates">Invertebrates</button>
              </app-menu>
            </ng-template>

            <ng-template #vertebrates>
              <app-menu side="right span-bottom">
                <button appMenuItem>Fish</button>
                <button appMenuItem>Amphibians</button>
                <button appMenuItem>Reptiles</button>
                <button appMenuItem>Birds</button>
                <button appMenuItem>Mammals</button>
              </app-menu>
            </ng-template>

            <ng-template #invertebrates>
              <app-menu side="right span-bottom">
                <button appMenuItem>Insects</button>
                <button appMenuItem>Molluscs</button>
                <button appMenuItem [appMenuTrigger]="vertebrates2">Crustaceans</button>
              </app-menu>
            </ng-template>

            <ng-template #vertebrates2>
              <app-menu side="right span-bottom">
                <button appMenuItem>Fish</button>
                <button appMenuItem>Amphibians</button>
                <button appMenuItem>Reptiles</button>
                <button appMenuItem>Birds</button>
                <button appMenuItem>Mammals</button>
              </app-menu>
            </ng-template>

            <ng-template #invertebrates2>
              <app-menu side="right span-bottom">
                <button appMenuItem>Insects</button>
                <button appMenuItem>Molluscs</button>
                <button appMenuItem>Crustaceans</button>
              </app-menu>
            </ng-template>
          </app-card-action>
        </app-card-header>
        <app-card-content> hi </app-card-content>
      </app-card>
    </div>
  `,
})
export class Home {
  console = console;
}
