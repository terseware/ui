import {Directive} from '@angular/core';

/** Groups related menu items under `role="group"`. */
@Directive({
  exportAs: 'menuGroup',
  host: {
    role: 'group',
  },
})
export class MenuGroup {}
