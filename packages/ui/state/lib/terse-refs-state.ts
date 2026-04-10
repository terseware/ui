import {computed, type Signal} from '@angular/core';
import {isString} from '@terseware/ui/internal';
import {PublicState} from './state';

/** An element id ref — either a resolved string or a signal that returns one. */
export type TerseRef = string | Signal<string>;

/**
 * Reactive ordered list of id refs rendered as a space-separated attribute
 * value. Base for every WAI-ARIA `IDREFS` attribute.
 */
export abstract class TerseRefsState extends PublicState<TerseRef[]> {
  /** Current refs joined with spaces, or `null` when empty (removes the attr). */
  readonly attr = computed(() => {
    const ids: string[] = [];
    for (const ref of this.toValue()) {
      ids.push(isString(ref) ? ref : ref());
    }
    return ids.length ? ids.join(' ') : null;
  });

  /** Append a ref; returns a cleanup that removes it again. */
  add(value: TerseRef): () => void {
    this.update((current) => [...current, value]);
    return () => this.update((current) => current.filter((v) => v !== value));
  }
}
