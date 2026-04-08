import {computed, Directive, inject, signal} from '@angular/core';
import {IdGenerator, SignalClass} from '@terseware/ui/internal';

/**
 * Generate and apply a unique, stable ID to any element.
 */
@Directive({
  exportAs: 'attrId',
  host: {
    '[id]': 'source()',
  },
})
export class AttrId<P extends string = 'terse'> extends SignalClass<`${P}-${number}`> {
  readonly #generator = inject(IdGenerator);

  readonly prefix = signal('terse' as P);

  /**
   * The generated atom ID from {@link IdGenerator} and applied to the host element's `id` attribute.
   */
  readonly source = computed(() => this.#generator.generate(this.prefix()));
}
