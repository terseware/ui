import {isPlatformServer} from '@angular/common';
import {Directive, inject, PLATFORM_ID, Renderer2, RendererStyleFlags2} from '@angular/core';
import {injectElement, Timeout} from '@terseware/ui/internal';

@Directive()
export class SupressTransitions {
  constructor() {
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

    // Restore after as timeout — the browser will have painted the correct
    // classes with transitions disabled, so re-enabling is safe.
    new Timeout().set(0, () => {
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
