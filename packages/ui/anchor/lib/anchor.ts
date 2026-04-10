import {Directive, inject, input, linkedSignal} from '@angular/core';
import {IdGenerator, optsBuilder} from '@terseware/ui/internal';
import {WritableSource} from '@terseware/ui/state';

export type AnchorName = `--anchor-${number}`;

export interface AnchorNameOpts {
  prefix: string;
}

const [provideAnchorNameOpts, injectAnchorNameOpts] = optsBuilder<AnchorNameOpts>(
  'AnchorName',
  {prefix: 'anchor'},
  (contribs, {prefix}) => ({prefix: contribs.map((c) => c.prefix).join('-') || prefix}),
);

export {provideAnchorNameOpts};

@Directive({
  exportAs: 'atomAnchor',
  host: {
    '[style.anchor-name]': 'toValue()',
  },
})
export class Anchor extends WritableSource<AnchorName> {
  readonly #opts = injectAnchorNameOpts();
  readonly prefix = input(this.#opts.prefix, {alias: 'anchorNamePrefix'});

  constructor() {
    const generator = inject(IdGenerator);
    super(linkedSignal(() => generator.generate(`--anchor`)));
  }
}
