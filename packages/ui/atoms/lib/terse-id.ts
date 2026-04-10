import {Directive, inject, input, linkedSignal} from '@angular/core';
import {IdGenerator, optsBuilder} from '@terseware/ui/internal';
import {WritableSource} from '@terseware/ui/state';

export type TerseIdValue = `${string}-${number}`;

export interface TerseIdOpts {
  prefix: string;
}

const [provideTerseIdOpts, injectTerseIdOpts] = optsBuilder<TerseIdOpts>(
  'TerseId',
  {prefix: 'terse'},
  (contribs, {prefix}) => ({prefix: contribs.map((c) => c.prefix).join('-') || prefix}),
);

export {provideTerseIdOpts};

/**
 * Generate and apply a unique, stable ID to any element.
 */
@Directive({
  exportAs: 'terseId',
  host: {
    '[id]': 'toValue()',
  },
})
export class TerseId extends WritableSource<TerseIdValue> {
  readonly #opts = injectTerseIdOpts();
  readonly prefix = input(this.#opts.prefix, {alias: 'terseIdPrefix'});

  constructor() {
    const generator = inject(IdGenerator);
    super(linkedSignal(() => generator.generate(this.prefix())));
  }
}
