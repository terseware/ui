import {Directive, inject, input, linkedSignal} from '@angular/core';
import {IdGenerator, optsBuilder} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** Generated id in the form `${prefix}-${number}`. */
export type TerseIdValue = `${string}-${number}`;

/** Prefix configuration for {@link TerseId}. */
export interface TerseIdOpts {
  prefix: string;
}

const [provideTerseIdOpts, injectTerseIdOpts] = optsBuilder<TerseIdOpts>(
  'TerseId',
  {prefix: 'terse'},
  (contribs, {prefix}) => ({prefix: contribs.map((c) => c.prefix).join('-') || prefix}),
);

export {provideTerseIdOpts};

/** Assigns a unique, reactive `id` to the host element. */
@Directive({
  exportAs: 'terseId',
  host: {
    '[id]': 'toValue()',
  },
})
export class TerseId extends State<TerseIdValue> {
  readonly #opts = injectTerseIdOpts();
  readonly prefix = input(this.#opts.prefix, {alias: 'terseIdPrefix'});

  constructor() {
    const generator = inject(IdGenerator);
    super(linkedSignal(() => generator.generate(this.prefix())));
  }
}
