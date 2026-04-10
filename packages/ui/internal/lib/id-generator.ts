import {InjectionToken} from '@angular/core';

export type Id<P extends string> = `${P}-${number}`;

export const IdGenerator = new InjectionToken(ngDevMode ? 'IdGenerator' : '', {
  providedIn: 'platform',
  factory: () => {
    const map = new Map<string, number>();
    let num = 0;
    return {
      generate<const P extends string>(prefix: P): Id<P> {
        prefix = (prefix.trim() || 'id') as P;
        const id = (map.get(prefix) ?? 0) + 1;
        map.set(prefix, id);
        return `${prefix}-${id}`;
      },
      num(): number {
        return ++num;
      },
    };
  },
});
