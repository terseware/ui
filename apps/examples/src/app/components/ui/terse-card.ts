import {Directive, inject, input} from '@angular/core';
import {TwClasses} from '@terseware/ui/atoms';

@Directive({
  selector: 'terse-card, [terseCard]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card',
    '[attr.data-size]': 'cardSize()',
  },
})
export class TerseCard {
  readonly cardSize = input<'default' | 'sm'>('default');
  constructor() {
    inject(TwClasses).classes(() => [
      'group/card flex flex-col gap-6 overflow-hidden rounded-xl bg-card py-6 text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
    ]);
  }
}

@Directive({
  selector: 'terse-card-header, [terseCardHeader]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card-header',
  },
})
export class TerseCardHeader {
  constructor() {
    inject(TwClasses).classes(() => [
      'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
    ]);
  }
}

@Directive({
  selector: 'terse-card-title, [terseCardTitle]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card-title',
  },
})
export class TerseCardTitle {
  constructor() {
    inject(TwClasses).classes(() => [
      'font-heading text-base leading-normal font-medium group-data-[size=sm]/card:text-sm',
    ]);
  }
}

@Directive({
  selector: 'terse-card-description, [terseCardDescription]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card-description',
  },
})
export class TerseCardDescription {
  constructor() {
    inject(TwClasses).classes(() => ['text-sm text-muted-foreground']);
  }
}

@Directive({
  selector: 'terse-card-action, [terseCardAction]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card-action',
  },
})
export class TerseCardAction {
  constructor() {
    inject(TwClasses).classes(() => [
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
    ]);
  }
}

@Directive({
  selector: 'terse-card-content, [terseCardContent]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card-content',
  },
})
export class TerseCardContent {
  constructor() {
    inject(TwClasses).classes(() => ['px-6 group-data-[size=sm]/card:px-4']);
  }
}

@Directive({
  selector: 'terse-card-footer, [terseCardFooter]',
  hostDirectives: [
    {
      directive: TwClasses,
      inputs: ['class'],
    },
  ],
  host: {
    'data-slot': 'card-footer',
  },
})
export class TerseCardFooter {
  constructor() {
    inject(TwClasses).classes(() => [
      'flex items-center rounded-b-xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4',
    ]);
  }
}
