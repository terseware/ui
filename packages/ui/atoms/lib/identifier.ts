import {Directive, inject, input, linkedSignal} from '@angular/core';
import {IdGenerator, optsBuilder} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** Generated id in the form `${prefix}-${number}`. */
export type AttrIdValue = `${string}-${number}`;

/** Prefix configuration for {@link Identifier}. */
export interface AttrIdOpts {
  prefix: string;
}

const [provideAttrIdOpts, injectAttrIdOpts] = optsBuilder<AttrIdOpts>(
  'AttrId',
  {prefix: 'terse'},
  (contribs, {prefix}) => ({prefix: contribs.map((c) => c.prefix).join('-') || prefix}),
);

export {provideAttrIdOpts};

/** Assigns a unique, reactive `id` to the host element. */
@Directive({
  exportAs: 'attrId',
  host: {
    '[id]': 'value()',
  },
})
export class Identifier extends State<AttrIdValue> {
  readonly #opts = injectAttrIdOpts();
  readonly prefix = input(this.#opts.prefix, {alias: 'attrIdPrefix'});

  constructor() {
    const generator = inject(IdGenerator);
    super(linkedSignal(() => generator.generate(this.prefix())));
  }
}
