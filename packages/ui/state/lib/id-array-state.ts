import {inject, type Signal, type WritableSignal} from '@angular/core';
import {HostAttributes, isString} from '@terseware/ui/internal';
import {State} from './state';

/** An element id ref — either a resolved string or a signal that returns one. */
export type IdRef = string | Signal<string>;

/**
 * Reactive ordered list of id refs rendered as a space-separated attribute
 * value. Base for every WAI-ARIA `IDREFS` attribute.
 */
export abstract class IdsAttribute extends State<IdRef[], string | null> {
  readonly #hostAttr = inject(HostAttributes);

  constructor(state: WritableSignal<IdRef[]>) {
    super(state, (value) => {
      const ids: string[] = [];
      for (const ref of value) {
        ids.push(isString(ref) ? ref : ref());
      }
      return ids.length ? ids.join(' ') : null;
    });
  }

  protected hostValue(attribute: string): IdRef[] {
    return this.toIdRefs(this.#hostAttr.get(attribute) ?? '');
  }

  protected toIdRefs(value: string | IdRef[]): IdRef[] {
    const ids = typeof value === 'string' ? (value.split(/\s+/).filter(Boolean) as IdRef[]) : value;
    return [...new Set(ids)];
  }

  /** Append a ref; returns a cleanup that removes it again. */
  add(value: IdRef): () => void {
    this.update((current) => [...current, value]);
    return () => this.update((current) => current.filter((v) => v !== value));
  }
}
