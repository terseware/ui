import {isPlatformServer} from '@angular/common';
import {
  afterNextRender,
  Directive,
  inject,
  input,
  linkedSignal,
  PLATFORM_ID,
  Renderer2,
  RendererStyleFlags2,
} from '@angular/core';
import {HostAttributes, injectElement} from '@terseware/ui/internal';
import {ConcatSource, ControlledSource} from '@terseware/ui/sources';
import clsx, {type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

@Directive({
  exportAs: 'classesMerger',
})
export class ClassesMerger extends ControlledSource<(result: ClassValue[]) => string> {
  readonly classesMerger = input(clsx);
  override source = linkedSignal(() => this.classesMerger());
}

@Directive({
  exportAs: 'classes',
  host: {
    '[class]': 'source()',
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

  constructor() {
    super();

    if (isPlatformServer(inject(PLATFORM_ID))) {
      return;
    }

    // Suppress transitions before the first paint so Angular's [class] binding
    // doesn't trigger CSS transitions when hydrating from SSR-rendered classes.
    const el = injectElement();
    const renderer = inject(Renderer2);
    const prev = el.style.getPropertyValue('transition');
    const prevPriority = el.style.getPropertyPriority('transition');
    renderer.setStyle(el, 'transition', 'none', RendererStyleFlags2.Important);

    // Restore after the first render — the browser will have painted the correct
    // classes with transitions disabled, so re-enabling is safe.
    afterNextRender(() => {
      if (prev) {
        renderer.setStyle(
          el,
          'transition',
          prev,
          prevPriority === 'important' ? RendererStyleFlags2.Important : undefined,
        );
      } else {
        renderer.removeStyle(el, 'transition');
      }
    });
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
