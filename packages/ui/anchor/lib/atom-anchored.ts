import {computed, Directive, inject, model} from '@angular/core';
import {injectCtx, isString, optsBuilder} from '@terse-ui/core/internal';
import {AtomAnchor, type AnchorName} from './atom-anchor';

const SIDE_TO_POSITION_AREA: Record<AnchorSide, string> = {
  top: 'block-start span-inline-start',
  bottom: 'block-end span-inline-start',
  left: 'inline-start span-block-start',
  right: 'inline-end span-block-start',
};

export type AnchorSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchorPosition = 'fixed' | 'absolute';

export interface AnchorOpts {
  side: AnchorSide;
  position: AnchorPosition;
  positionTryFallbacks: string[];
  margin: string | number;
}

const [provideAnchorOpts, injectAnchorOpts] = optsBuilder<AnchorOpts>('Anchor', {
  side: 'bottom',
  position: 'fixed',
  positionTryFallbacks: ['flip-block', 'flip-inline', 'flip-block flip-inline'],
  margin: 0,
});

export {provideAnchorOpts};

@Directive({
  selector: '[atomAnchored]',
  exportAs: 'atomAnchored',
  host: {
    '[style.position]': 'position()',
    '[style.position-anchor]': 'positionAnchor()',
    '[style.position-area]': 'positionArea()',
    '[style.position-try-fallbacks]': 'positionTryFallbacks()',
    '[style.margin]': 'margin()',
  },
})
export class AtomAnchored {
  readonly #injCtx = injectCtx();
  readonly #options = injectAnchorOpts();

  readonly atomAnchored = model<AtomAnchor | AnchorName>();

  readonly positionAnchor = computed(() => {
    const anchored = this.atomAnchored();
    if (isString(anchored)) {
      return anchored;
    }
    if (isString(anchored?.anchorName)) {
      return anchored.anchorName;
    }
    return this.#injCtx(() => inject(AtomAnchor).anchorName);
  });

  readonly position = model<AnchorPosition>(this.#options.position, {
    alias: 'atomAnchoredPosition',
  });

  readonly positionTryFallbacks = model<string[]>(this.#options.positionTryFallbacks, {
    alias: 'atomAnchoredPositionTryFallbacks',
  });

  readonly side = model<AnchorSide>(this.#options.side, {alias: 'atomAnchoredSide'});
  readonly positionArea = computed(() => SIDE_TO_POSITION_AREA[this.side()]);

  readonly margin = model<string | number>(this.#options.margin, {alias: 'atomAnchoredMargin'});
}
