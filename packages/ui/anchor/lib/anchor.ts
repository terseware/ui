import {computed, Directive, inject} from '@angular/core';
import {IdGenerator} from '@terseware/ui/internal';
import {Source} from '@terseware/ui/sources';

export type AnchorName = `--anchor-${number}`;

@Directive({
  exportAs: 'atomAnchor',
  host: {
    '[style.anchor-name]': 'source()',
  },
})
export class Anchor extends Source<AnchorName> {
  readonly #generator = inject(IdGenerator);

  /**
   * The generated atom anchor name applied to the host element's `style.anchor-name` attribute.
   */
  readonly source = computed(() => this.#generator.generate(`--anchor`));
}
