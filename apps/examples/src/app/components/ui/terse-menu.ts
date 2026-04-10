import {Directive, inject} from '@angular/core';
import {TwClasses} from '@terseware/ui/atoms';
import {Menu, MenuItem, MenuTrigger, MenuTriggerFor} from '@terseware/ui/menu';

@Directive({
  selector: 'terse-menu-item, [terseMenuItem]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    MenuItem,
  ],
})
export class TerseMenuItem {
  constructor() {
    inject(TwClasses).classes(() => [
      "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
    ]);
  }
}

@Directive({
  selector: 'terse-menu, [terseMenu]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    Menu,
  ],
  host: {
    'data-slot': 'menu',
  },
})
export class TerseMenu {
  constructor() {
    inject(TwClasses).classes(() => [
      'z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95',
    ]);
  }
}

@Directive({
  selector: 'terse-menu-trigger, [terseMenuTrigger]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    {
      directive: MenuTriggerFor,
      inputs: ['menuTriggerFor:terseMenuTrigger'],
    },
    MenuTrigger,
  ],
})
export class TerseMenuTrigger {}

@Directive({
  selector: 'terse-menu-group, [terseMenuGroup]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
})
export class TerseMenuGroup {}
