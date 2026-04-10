import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {ConcatSource, PublicState} from '@terseware/ui/state';
import clsx, {type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {SupressTransitions} from './suppress-transitions';

/** Function that folds a list of class contributions into a single string. */
export type ClassesMergerValue = (result: ClassValue[]) => string;

/** Pluggable merger used by {@link Classes}. Defaults to `clsx`. */
@Directive({
  exportAs: 'classesMerger',
})
export class ClassesMerger extends PublicState<ClassesMergerValue> {
  readonly classesMerger = input(clsx);

  constructor() {
    super(linkedSignal(() => this.classesMerger()));
  }
}

/**
 * Composable host `class` binding. Contributions from composing directives
 * are stacked via {@link ConcatSource}, flattened with the active merger,
 * and rendered onto `[class]`.
 */
@Directive({
  exportAs: 'classes',
  hostDirectives: [ClassesMerger, SupressTransitions],
  host: {
    '[class]': 'toValue()',
  },
})
export class Classes extends ConcatSource<string, ClassValue[] | string> {
  readonly merger = inject(ClassesMerger);

  /** Consumer-supplied class(es) applied to the host element. */
  readonly class = input<ClassValue>(inject(HostAttributes).get('class'));

  protected override merge(pre: string[], post: string[]): string {
    return this.merger()([...pre, this.class(), ...post])?.trim() || '';
  }
}

/** {@link Classes} with `tailwind-merge` deduping, plus a `variants()` CVA helper. */
@Directive({
  exportAs: 'twClasses',
})
export class TwClasses extends Classes {
  constructor() {
    super();
    this.merger.set((c) => twMerge(clsx(c)));
  }

  /** Register a reactive class contribution. Returns a cleanup. */
  classes(fn: () => ClassValue[] | string): () => void {
    return this.pre(fn);
  }

  /** Wire a `cva()` variants function to reactive props. `class`/`className` are excluded — the consumer binding handles those. */
  variants<T>(
    cvaFn: (props: T) => string,
    props: () => {[K in keyof T as K extends 'class' | 'className' ? never : K]: NoInfer<T[K]>},
  ): () => void {
    return this.pre(() => cvaFn(props() as T));
  }
}
