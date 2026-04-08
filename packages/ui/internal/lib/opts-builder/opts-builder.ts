import type {InjectOptions, Provider} from '@angular/core';
import {inject, InjectionToken, INJECTOR} from '@angular/core';
import type {DeepPartial, MaybeFn} from '../typings';
import {unwrapInject, unwrapMergeInject} from '../unwrap';

export type OptsBuilderResult<Options extends object> = [
  provideOpts: (opts: MaybeFn<DeepPartial<Options>>) => Provider[],
  injectOpts: (injOpts?: Omit<InjectOptions, 'optional'>) => Options,
];

/**
 * Returns `[provideOpts, injectOpts]` for hierarchical, deep-merged
 * configuration. All contributes are resolved upon calling `injectOpts`.
 *
 * @example
 * ```ts
 * const [provideAppButtonOpts, injectAppButtonOpts] = optsBuilder<AppButtonOpts>(() => ({
 *   disabled: false,
 *   tabIndex: numberAttribute(inject(new HostAttributeToken('tabindex'), {optional: true}) ?? 0, 0),
 * }));
 * ```
 */
export function optsBuilder<Opts extends object>(
  dbgName: string,
  defaultOpts: MaybeFn<Opts>,
  merger?: (contribs: DeepPartial<Opts>[], defaultVal: Opts) => Opts,
): OptsBuilderResult<Opts> {
  const optsToken = new InjectionToken<Opts>(ngDevMode ? `Opts:${dbgName}` : '');

  const optsContributionToken = new InjectionToken<MaybeFn<DeepPartial<Opts>>[]>(
    ngDevMode ? `OptsContribution:${dbgName}` : '',
  );

  function injectOpts(opts: Omit<InjectOptions, 'optional'> = {}): Opts {
    const inj = inject(INJECTOR);
    const contribs = inject(optsContributionToken, {...opts, optional: true}) ?? [];
    if (merger) {
      return merger(
        contribs.map((c) => unwrapInject(inj, c)),
        unwrapInject(inj, defaultOpts),
      );
    }
    return unwrapMergeInject(inj, defaultOpts, ...contribs);
  }

  function provideOpts(opts: MaybeFn<DeepPartial<Opts>>): Provider[] {
    return [
      {
        multi: true,
        provide: optsContributionToken,
        useValue: opts,
      },
      {
        provide: optsToken,
        useFactory: injectOpts,
      },
    ];
  }

  return [provideOpts, injectOpts] as const;
}
