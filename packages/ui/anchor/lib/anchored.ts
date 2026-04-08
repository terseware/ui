import {computed, Directive, inject, model} from '@angular/core';
import {setupContext} from '@signality/core/internal';
import {isString, optsBuilder} from '@terseware/ui/internal';
import {Anchor, type AnchorName} from './anchor';

const SIDE_TO_POSITION_AREA: Record<AnchoredSide, string> = {
  top: 'block-start span-inline-start',
  bottom: 'block-end span-inline-start',
  left: 'inline-start span-block-start',
  right: 'inline-end span-block-start',
};

export type AnchoredSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchoredPosition = 'fixed' | 'absolute';

export interface AnchoredOpts {
  margin: string | number;
  position: AnchoredPosition;
  positionTryFallbacks: string[];
  side: AnchoredSide;
}

const [provideAnchoredOpts, injectAnchoredOpts] = optsBuilder<AnchoredOpts>('Anchor', {
  margin: 0,
  position: 'fixed',
  positionTryFallbacks: ['flip-block', 'flip-inline', 'flip-block flip-inline'],
  side: 'bottom',
});

export {provideAnchoredOpts};

@Directive({
  exportAs: 'anchored',
  host: {
    '[style.margin]': 'anchoredMargin()',
    '[style.position-anchor]': 'positionAnchor()',
    '[style.position-area]': 'positionArea()',
    '[style.position-try-fallbacks]': 'anchoredPositionTryFallbacks()',
    '[style.position]': 'anchoredPosition()',
  },
})
export class Anchored {
  readonly #ctx = setupContext();
  readonly #options = injectAnchoredOpts();

  readonly anchored = model<Anchor | AnchorName>();

  readonly positionAnchor = computed(() => {
    const inp = this.anchored();
    if (isString(inp)) {
      return inp;
    }
    const anchored = inp?.();
    if (isString(anchored)) {
      return anchored;
    }
    return this.#ctx.runInContext(() => inject(Anchor)());
  });

  readonly anchoredMargin = model<string | number>(this.#options.margin);
  readonly anchoredPosition = model<AnchoredPosition>(this.#options.position);
  readonly anchoredPositionTryFallbacks = model<string[]>(this.#options.positionTryFallbacks);
  readonly anchoredSide = model<AnchoredSide>(this.#options.side);
  readonly positionArea = computed(() => SIDE_TO_POSITION_AREA[this.anchoredSide()]);
}
