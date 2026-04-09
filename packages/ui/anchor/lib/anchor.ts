import {Directive, inject, linkedSignal} from '@angular/core';
import {IdGenerator} from '@terseware/ui/internal';
import {Source} from '@terseware/ui/sources';

export type AnchorName = `--anchor-${number}`;

@Directive({
  exportAs: 'atomAnchor',
  host: {
    '[style.anchor-name]': 'toValue()',
  },
})
export class Anchor extends Source<AnchorName> {
  constructor() {
    const generator = inject(IdGenerator);
    super(linkedSignal(() => generator.generate(`--anchor`)));
  }
}
