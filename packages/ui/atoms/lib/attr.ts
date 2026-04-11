import {booleanAttribute, Directive, signal} from '@angular/core';
import {
  hasDisabledAttribute,
  hasRequiredAttribute,
  hostAttr,
  injectElement,
} from '@terseware/ui/internal';
import {IdListState, State} from '@terseware/ui/state';

@Directive({
  exportAs: 'disabledAttr',
  host: {
    '[attr.disabled]': 'value() ? "" : null',
  },
})
export class DisabledAttr extends State<boolean> {
  constructor() {
    const native = hasDisabledAttribute(injectElement());
    super(signal(booleanAttribute(hostAttr('disabled'))), (v) => (native ? v : false));
  }
}

@Directive({
  exportAs: 'requiredAttr',
  host: {
    '[attr.required]': 'value() ? "" : null',
  },
})
export class RequiredAttr extends State<boolean> {
  constructor() {
    const native = hasRequiredAttribute(injectElement());
    super(signal(booleanAttribute(hostAttr('required'))), (v) => (native ? v : false));
  }
}

@Directive({
  exportAs: 'ariaDisabledAttr',
  host: {
    '[attr.aria-disabled]': 'value()',
  },
})
export class AriaDisabledAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('aria-disabled')));
  }
}

@Directive({
  exportAs: 'ariaCheckedAttr',
  host: {
    '[attr.aria-checked]': 'value()',
  },
})
export class AriaCheckedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('aria-checked')));
  }
}

@Directive({
  exportAs: 'dataCheckedAttr',
  host: {
    '[attr.data-checked]': 'value()',
  },
})
export class DataCheckedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('data-checked')));
  }
}

@Directive({
  exportAs: 'dataHighlghtedAttr',
  host: {
    '[attr.data-highlighted]': 'value()',
  },
})
export class DataHighlghtedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('data-highlighted')));
  }
}

@Directive({
  exportAs: 'dataUncheckedAttr',
  host: {
    '[attr.data-unchecked]': 'value()',
  },
})
export class DataUncheckedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('data-unchecked')));
  }
}

@Directive({
  exportAs: 'dataDisabledAttr',
  host: {
    '[attr.data-disabled]': 'value()',
  },
})
export class DataDisabledAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('data-disabled')));
  }
}

@Directive({
  exportAs: 'dataOpenedAttr',
  host: {
    '[attr.data-opened]': 'value()',
  },
})
export class DataOpenedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('data-opened')));
  }
}

@Directive({
  exportAs: 'dataClosedAttr',
  host: {
    '[attr.data-closed]': 'value()',
  },
})
export class DataClosedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('data-closed')));
  }
}

@Directive({
  exportAs: 'ariaExpandedAttr',
  host: {
    '[aria-expanded]': 'value()',
  },
})
export class AriaExpandedAttr extends State<string | null> {
  constructor() {
    super(signal(hostAttr('aria-expanded')));
  }
}

@Directive({
  exportAs: 'ariaControlsAttr',
  host: {
    '[attr.aria-controls]': 'value()',
  },
})
export class AriaControls extends IdListState {
  constructor() {
    super(signal(hostAttr('aria-controls')));
  }
}

@Directive({
  exportAs: 'ariaDescribedByAttr',
  host: {
    '[attr.aria-describedby]': 'value()',
  },
})
export class AriaDescribedBy extends IdListState {
  constructor() {
    super(signal(hostAttr('aria-describedby')));
  }
}

@Directive({
  exportAs: 'ariaDetailsAttr',
  host: {
    '[attr.aria-details]': 'value()',
  },
})
export class AriaDetails extends IdListState {
  constructor() {
    super(signal(hostAttr('aria-details')));
  }
}

@Directive({
  exportAs: 'ariaFlowToAttr',
  host: {
    '[attr.aria-flowto]': 'value()',
  },
})
export class AriaFlowTo extends IdListState {
  constructor() {
    super(signal(hostAttr('aria-flowto')));
  }
}

const haspopupList = ['menu', 'listbox', 'tree', 'grid', 'dialog'] as const;
export type AriaHasPopupValues = (typeof haspopupList)[number] | null;
const haspopupListSet = new Set(haspopupList);

@Directive({
  exportAs: 'ariaHasPopupAttr',
  host: {
    '[aria-haspopup]': 'value()',
  },
})
export class AriaHasPopup extends State<AriaHasPopupValues> {
  constructor() {
    super(signal(hostAttr('aria-haspopup') as AriaHasPopupValues), (s) =>
      s && haspopupListSet.has(s) ? s : null,
    );
  }
}

@Directive({
  exportAs: 'ariaLabelledByAttr',
  host: {
    '[attr.aria-labelledby]': 'value()',
  },
})
export class AriaLabelledBy extends IdListState {
  constructor() {
    super(signal(hostAttr('aria-labelledby')));
  }
}

@Directive({
  exportAs: 'ariaOwnsAttr',
  host: {
    '[attr.aria-owns]': 'value()',
  },
})
export class AriaOwns extends IdListState {
  constructor() {
    super(signal(hostAttr('aria-owns')));
  }
}
