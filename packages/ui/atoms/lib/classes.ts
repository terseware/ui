import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicConcatSource, PublicSource} from '@terseware/ui/sources';
import clsx, {type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {SupressTransitions} from '../utils';

export type ClassesMergerValue = (result: ClassValue[]) => string;

@Directive({
  exportAs: 'classesMerger',
})
export class ClassesMerger extends PublicSource<ClassesMergerValue> {
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
export class Classes extends PublicConcatSource<string, ClassValue[] | string> {
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

  /**
   * Register a CVA variant function as a reactive class source.
   *
   * @param fn - The return value of `cva(base, config)`
   * @param props - Factory returning resolved variant props (reads signals inside for reactivity).
   *   `class`/`className` are excluded — `ConcatSource.merge()` handles user class input separately.
   *
   * @example
   * ```ts
   * const buttonVariants = cva('inline-flex ...', { variants: { variant: { ... }, size: { ... } } });
   *
   * inject(TwClasses).variants(buttonVariants, () => ({
   *   variant: this.terseButton(),
   *   size: this.size(),
   * }));
   * ```
   */
  variants<T>(
    fn: (props: T) => string,
    props: () => {[K in keyof T as K extends 'class' | 'className' ? never : K]: NoInfer<T[K]>},
  ): () => void {
    return this.pre(() => fn(props() as T));
  }
}
