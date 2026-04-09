import {Directive, inject, linkedSignal} from '@angular/core';
import {IdGenerator} from '@terseware/ui/internal';
import {Source} from '@terseware/ui/sources';

export type TerseIdValue = `${string}-${number}`;

/**
 * Generate and apply a unique, stable ID to any element.
 */
@Directive({
  exportAs: 'terseId',
  host: {
    '[id]': 'toValue()',
  },
})
export class TerseId extends Source<TerseIdValue> {
  constructor() {
    const generator = inject(IdGenerator);
    super(linkedSignal(() => generator.generate('terse')));
  }
}
