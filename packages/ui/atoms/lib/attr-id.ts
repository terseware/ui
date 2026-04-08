import {computed, Directive, inject, input} from '@angular/core';
import {IdGenerator, optsBuilder} from '@terseware/ui/internal';
import {Source} from '@terseware/ui/sources';

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
    '[id]': 'source()',
  },
})
export class TerseId extends Source<TerseIdValue> {
  readonly #opts = injectTerseIdOpts();
  readonly #generator = inject(IdGenerator);

  readonly prefix = input(this.#opts.prefix, {alias: 'terseIdPrefix'});

  /**
   * The generated atom ID from {@link IdGenerator} and applied to the host element's `id` attribute.
   */
  readonly source = computed(() => this.#generator.generate(this.prefix()));
}
