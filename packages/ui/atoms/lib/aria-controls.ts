import {computed, Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes, isString} from '@terseware/ui/internal';
import {Source} from '@terseware/ui/sources';
import type {TerseId, TerseIdValue} from './terse-id';

export type AriaControlsValue = TerseId | TerseIdValue;

@Directive({
  exportAs: 'ariaControls',
  host: {
    '[aria-controls]': 'attr()',
  },
})
export class AriaControls extends Source<AriaControlsValue[]> {
  readonly #init = inject(HostAttributes).get('aria-expanded')?.split(',');
  readonly ariaControls = input((this.#init ?? []) as AriaControlsValue[]);

  protected readonly attr = computed(() => {
    const ids: string[] = [];
    for (const inp of this.toValue()) {
      if (isString(inp)) {
        ids.push(inp);
      } else {
        ids.push(inp());
      }
    }
    return ids.join(',');
  });

  constructor() {
    super(linkedSignal(() => this.ariaControls()));
  }

  add(value: AriaControlsValue) {
    this.update((s) => [...s, value]);
    return () => this.update((src) => src.filter((s) => s !== value));
  }
}
