import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {ConcatSource, PublicWritableSource} from '@terseware/ui/state';
import clsx, {type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {SupressTransitions} from '../utils';

export type ClassesMergerValue = (result: ClassValue[]) => string;

@Directive({
  exportAs: 'classesMerger',
})
export class ClassesMerger extends PublicWritableSource<ClassesMergerValue> {
  readonly classesMerger = input(clsx);

  constructor() {
    super(linkedSignal(() => this.classesMerger()));
  }
}

@Directive({
  exportAs: 'classes',
  hostDirectives: [ClassesMerger, SupressTransitions],
  host: {
    '[class]': 'toValue()',
  },
})
export class Classes extends ConcatSource<string, ClassValue[] | string> {
  readonly merger = inject(ClassesMerger);

  /**
   * ClassValue to be applied to the host element.
   */
  readonly class = input<ClassValue>(inject(HostAttributes).get('class'));

  protected override merge(pre: string[], post: string[]): string {
    return this.merger()([...pre, this.class(), ...post])?.trim() || '';
  }
}

@Directive({
  exportAs: 'twClasses',
})
export class TwClasses extends Classes {
  constructor() {
    super();
    this.merger.set((c) => twMerge(clsx(c)));
  }

  classes(fn: () => ClassValue[] | string): () => void {
    return this.pre(fn);
  }

  /**
   * Register a CVA variant function as a reactive class source.
   *
   * @param cvaFn - The return value of `cva(base, config)`
   * @param props - Factory returning resolved variant props (reads signals inside for reactivity).
   *   `class`/`className` are excluded — `ConcatSource.merge()` handles user class input separately.
   *
   * @example
   * ```ts
   * const buttonVariants = cva('inline-flex ...', { variants: { variant: { ... }, size: { ... } } });
   *
   * inject(TwClasses).variants(buttonVariants, () => ({
   *   variant: this.terseButton() || 'default',
   *   size: this.size(),
   * }));
   * ```
   */
  variants<T>(
    cvaFn: (props: T) => string,
    props: () => {[K in keyof T as K extends 'class' | 'className' ? never : K]: NoInfer<T[K]>},
  ): () => void {
    return this.pre(() => cvaFn(props() as T));
  }
}
