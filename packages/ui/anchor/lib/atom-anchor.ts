import {computed, Directive, inject, signal} from '@angular/core';
import {IdGenerator, SignalClass} from '@terseware/ui/internal';

export type AnchorName<P extends string = 'anchor'> = `--${P}-${number}`;

@Directive({
  exportAs: 'atomAnchor',
  host: {
    '[style.anchor-name]': 'source()',
  },
})
export class Anchor<P extends string = 'anchor'> extends SignalClass<AnchorName<P>> {
  readonly #generator = inject(IdGenerator);

  readonly prefix = signal('anchor' as P);

  /**
   * The generated atom anchor name applied to the host element's `style.anchor-name` attribute.
   */
  readonly source = computed(() => this.#generator.generate(`--${this.prefix()}`));
}
