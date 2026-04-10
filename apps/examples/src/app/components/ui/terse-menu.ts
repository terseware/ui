import {booleanAttribute, Directive, inject, input} from '@angular/core';
import {TwClasses} from '@terseware/ui/atoms';
import {Button} from '@terseware/ui/button';
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerFor,
} from '@terseware/ui/menu';

// -----------------------------------------------------------------------------
// Trigger + popup
// -----------------------------------------------------------------------------

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
    Button,
    MenuTrigger,
  ],
})
export class TerseMenuTrigger {}

@Directive({
  selector: 'terse-menu, [terseMenu]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    {
      directive: Menu,
      inputs: ['side', 'offset'],
    },
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

// -----------------------------------------------------------------------------
// Item variants
// -----------------------------------------------------------------------------

@Directive({
  selector: 'terse-menu-item, [terseMenuItem]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    MenuItem,
  ],
  host: {
    'data-slot': 'menu-item',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[attr.data-variant]': 'variant()',
  },
})
export class TerseMenuItem {
  /** Shifts the item's content to align with items that have a leading icon. */
  readonly inset = input(false, {transform: booleanAttribute});
  /** Visual variant — `'destructive'` flips to error colors for dangerous actions. */
  readonly variant = input<'default' | 'destructive'>('default');

  constructor() {
    inject(TwClasses).classes(() => [
      "group/menu-item relative w-full flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-inset:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive",
    ]);
  }
}

@Directive({
  selector: 'terse-menu-checkbox-item, [terseMenuCheckboxItem]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    {
      directive: MenuCheckboxItem,
      inputs: ['checked'],
      outputs: ['checkedChange'],
    },
  ],
  host: {
    'data-slot': 'menu-checkbox-item',
  },
})
export class TerseMenuCheckboxItem {
  constructor() {
    inject(TwClasses).classes(() => [
      "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ]);
  }
}

@Directive({
  selector: 'terse-menu-radio-group, [terseMenuRadioGroup]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    {
      directive: MenuRadioGroup,
      inputs: ['value'],
      outputs: ['valueChange'],
    },
  ],
  host: {
    'data-slot': 'menu-radio-group',
  },
})
export class TerseMenuRadioGroup {}

@Directive({
  selector: 'terse-menu-radio-item, [terseMenuRadioItem]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    {
      directive: MenuRadioItem,
      inputs: ['value'],
    },
  ],
  host: {
    'data-slot': 'menu-radio-item',
  },
})
export class TerseMenuRadioItem {
  constructor() {
    inject(TwClasses).classes(() => [
      "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ]);
  }
}

// -----------------------------------------------------------------------------
// Groups, labels, separators, shortcuts
// -----------------------------------------------------------------------------

@Directive({
  selector: 'terse-menu-group, [terseMenuGroup]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    MenuGroup,
  ],
  host: {
    'data-slot': 'menu-group',
  },
})
export class TerseMenuGroup {}

@Directive({
  selector: 'terse-menu-label, [terseMenuLabel]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'menu-label',
    '[attr.data-inset]': 'inset() ? "" : null',
  },
})
export class TerseMenuLabel {
  /** Shifts the label to align with items that have a leading icon. */
  readonly inset = input(false, {transform: booleanAttribute});

  constructor() {
    inject(TwClasses).classes(() => [
      'px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8',
    ]);
  }
}

@Directive({
  selector: 'terse-menu-separator, [terseMenuSeparator]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    MenuSeparator,
  ],
  host: {
    'data-slot': 'menu-separator',
  },
})
export class TerseMenuSeparator {
  constructor() {
    inject(TwClasses).classes(() => ['-mx-1 my-1 h-px bg-border']);
  }
}

@Directive({
  selector: 'terse-menu-shortcut, [terseMenuShortcut]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'menu-shortcut',
  },
})
export class TerseMenuShortcut {
  constructor() {
    inject(TwClasses).classes(() => [
      'ml-auto text-xs tracking-widest text-muted-foreground group-focus/menu-item:text-accent-foreground',
    ]);
  }
}
