import {Directive} from '@angular/core';

/** Non-focusable visual divider with `role="separator"`. Does not compose `MenuItem`, so roving focus skips it. */
@Directive({
  exportAs: 'menuSeparator',
  host: {
    role: 'separator',
    'aria-orientation': 'horizontal',
  },
})
export class MenuSeparator {}
