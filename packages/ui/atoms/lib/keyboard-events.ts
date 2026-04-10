import {Directive, type Signal} from '@angular/core';

/** A key to match against. Strings match case-insensitively; RegExp matches `event.key`. */
export type KeyCode = string | Signal<string> | RegExp;

/** Bitwise modifier flags. Combine with `|` for multi-modifier combos (e.g. `Modifier.Ctrl | Modifier.Shift`). */
export enum Modifier {
  None = 0,
  Ctrl = 0b1,
  Shift = 0b10,
  Alt = 0b100,
  Meta = 0b1000,
}

/** A single modifier flag, or an array of alternatives (matches if ANY alternative matches). */
export type ModifierInput = Modifier | Modifier[];

export interface KeyHandlerOptions {
  /** Prevent the default browser action. Default: `true`. */
  preventDefault: boolean;
  /** Stop event propagation. Default: `true`. */
  stopPropagation: boolean;
  /** Ignore repeated key events (key held down). Default: `true`. */
  ignoreRepeat: boolean;
}

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyConfig {
  matcher: (event: KeyboardEvent) => boolean;
  handler: KeyHandler;
  options: KeyHandlerOptions;
}

const DEFAULTS: KeyHandlerOptions = {
  preventDefault: true,
  stopPropagation: true,
  ignoreRepeat: true,
};

function getModifiers(event: KeyboardEvent): number {
  let flags = 0;
  if (event.ctrlKey) flags |= Modifier.Ctrl;
  if (event.shiftKey) flags |= Modifier.Shift;
  if (event.altKey) flags |= Modifier.Alt;
  if (event.metaKey) flags |= Modifier.Meta;
  return flags;
}

function matchesModifiers(event: KeyboardEvent, modifiers: ModifierInput): boolean {
  const eventMods = getModifiers(event);
  const list = Array.isArray(modifiers) ? modifiers : [modifiers];
  return list.some((m) => eventMods === m);
}

function matchesKey(event: KeyboardEvent, key: KeyCode): boolean {
  if (key instanceof RegExp) {
    return key.test(event.key);
  }
  const keyStr = typeof key === 'string' ? key : key();
  return keyStr.toLowerCase() === event.key.toLowerCase();
}

@Directive({
  exportAs: 'keyboardEvents',
  host: {
    '(keydown)': 'handle($event)',
  },
})
export class KeyboardEvents {
  readonly #configs: KeyConfig[] = [];

  /** Register a handler for a key with no required modifiers. */
  on(key: KeyCode, handler: KeyHandler, options?: Partial<KeyHandlerOptions>): this;
  /** Register a handler for a modifier + key combination. */
  on(
    modifiers: ModifierInput,
    key: KeyCode,
    handler: KeyHandler,
    options?: Partial<KeyHandlerOptions>,
  ): this;
  on(...args: unknown[]): this {
    const {modifiers, key, handler, options} = this.#normalize(args);

    this.#configs.push({
      handler,
      matcher: (event) => {
        if (!matchesModifiers(event, modifiers)) return false;
        if (event.repeat && options.ignoreRepeat) return false;
        return matchesKey(event, key);
      },
      options,
    });

    return this;
  }

  /** Dispatch a keyboard event to all matching handlers. */
  protected handle(event: KeyboardEvent): void {
    for (const config of this.#configs) {
      if (config.matcher(event)) {
        config.handler(event);
        if (config.options.preventDefault) event.preventDefault();
        if (config.options.stopPropagation) event.stopPropagation();
      }
    }
  }

  #normalize(args: unknown[]): {
    modifiers: ModifierInput;
    key: KeyCode;
    handler: KeyHandler;
    options: KeyHandlerOptions;
  } {
    const withModifiers = typeof args[0] === 'number' || Array.isArray(args[0]);
    return {
      modifiers: (withModifiers ? args[0] : Modifier.None) as ModifierInput,
      key: (withModifiers ? args[1] : args[0]) as KeyCode,
      handler: (withModifiers ? args[2] : args[1]) as KeyHandler,
      options: {
        ...DEFAULTS,
        ...((withModifiers ? args[3] : args[2]) as Partial<KeyHandlerOptions>),
      },
    };
  }
}
