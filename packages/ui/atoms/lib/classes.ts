import {isPlatformServer} from '@angular/common';
import {
  afterNextRender,
  Directive,
  inject,
  input,
  PLATFORM_ID,
  Renderer2,
  RendererStyleFlags2,
} from '@angular/core';
import {
  HostAttributes,
  injectElement,
  optsBuilder,
  SignalConcatMerge,
} from '@terseware/ui/internal';
import {clsx, type ClassValue} from 'clsx';

export interface ClassesOptions {
  mapResult: (result: ClassValue[]) => string;
}

const [provideClassesOpts, injectClassesOpts] = optsBuilder<ClassesOptions>('Classes', {
  mapResult: (result) => clsx(result),
});

export {provideClassesOpts};

@Directive({
  exportAs: 'classes',
  host: {
    '[class]': 'source()',
  },
})
export class Classes extends SignalConcatMerge<string, ClassValue[] | string> {
  readonly #renderer = inject(Renderer2);
  readonly #opts = injectClassesOpts();
  readonly #hostAttribs = inject(HostAttributes);

  /**
   * ClassValue to be applied to the host element.
   */
  readonly class = input<ClassValue>(this.#hostAttribs.get('class'));

  override merge(pre: string[], post: string[]): string {
    return this.#opts.mapResult([...pre, this.class(), ...post])?.trim() || '';
  }

  constructor() {
    super();

    if (isPlatformServer(inject(PLATFORM_ID))) {
      return;
    }

    // Suppress transitions before the first paint so Angular's [class] binding
    // doesn't trigger CSS transitions when hydrating from SSR-rendered classes.
    const el = injectElement();
    const prev = el.style.getPropertyValue('transition');
    const prevPriority = el.style.getPropertyPriority('transition');
    this.#renderer.setStyle(el, 'transition', 'none', RendererStyleFlags2.Important);

    // Restore after the first render — the browser will have painted the correct
    // classes with transitions disabled, so re-enabling is safe.
    afterNextRender(() => {
      if (prev) {
        this.#renderer.setStyle(
          el,
          'transition',
          prev,
          prevPriority === 'important' ? RendererStyleFlags2.Important : undefined,
        );
      } else {
        this.#renderer.removeStyle(el, 'transition');
      }
    });
  }
}
