import {HostAttributeToken, inject, INJECTOR, runInInjectionContext} from '@angular/core';
import {AutoHost} from './auto-host';
import {staticCache} from './static-cache';

@AutoHost()
export class HostAttributes {
  readonly #injector = inject(INJECTOR);

  readonly #cache = staticCache((key: string) =>
    runInInjectionContext(this.#injector, () =>
      inject(new HostAttributeToken(key), {optional: true}),
    ),
  );

  get(key: string) {
    return this.#cache(key);
  }
}
