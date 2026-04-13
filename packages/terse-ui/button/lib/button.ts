import {Directive, HOST_TAG_NAME, inject, input, linkedSignal} from '@angular/core';
import {listener} from '@signality/core';
import {AriaDisabled, DataDisabled, Disabled, Role, TabIndex, Type} from '@terse-ui/core/attr';
import {OnKeyDown, OnKeyUp} from '@terse-ui/core/events';
import {
  configBuilder,
  hasDisabledAttribute,
  injectElement,
  isAnchorElement,
  isBoolean,
  isButtonElement,
  isInputElement,
  StatePipeline,
  type DeepPartial,
} from '@terse-ui/core/utils';

export interface ButtonOptions {
  captureClick: boolean;
  captureMouseDown: boolean;
  capturePointerDown: boolean;
}

export interface ButtonDefaults {
  disabled: boolean | 'soft';
  options: ButtonOptions;
}

const [provideButtonConfig, injectButtonConfig] = configBuilder<{defaults: ButtonDefaults}>(
  'Button',
  {
    defaults: {
      disabled: false,
      options: {
        captureClick: true,
        captureMouseDown: true,
        capturePointerDown: true,
      },
    },
  },
);

export {provideButtonConfig};

interface ButtonInnerState {
  disabled: boolean | 'soft';
  options: ButtonOptions;
}

export interface ButtonState {
  disabled: boolean;
  softDisabled: boolean;
  disabledVariant: 'soft' | 'hard' | null;
  options: {
    captureClick: boolean;
    captureMouseDown: boolean;
    capturePointerDown: boolean;
  };
}

@Directive({
  exportAs: 'buttonBase',
  hostDirectives: [TabIndex, Disabled, DataDisabled, AriaDisabled, Role, Type, OnKeyDown, OnKeyUp],
})
export class ButtonBase extends StatePipeline<ButtonInnerState, ButtonState> {
  readonly #config = injectButtonConfig();
  readonly #element = injectElement();
  readonly #isNativeButton = inject(HOST_TAG_NAME) === 'button';
  readonly #hasDisabledAttribute = hasDisabledAttribute(this.#element);

  // These must be used in a getter because attributes can change dynamically.
  get #isValidLink(): boolean {
    return isAnchorElement(this.#element, {validLink: true});
  }
  get #isButtonInput(): boolean {
    return isInputElement(this.#element, {types: ['button', 'submit', 'reset', 'image']});
  }
  get #implicitRole(): boolean {
    return this.#isNativeButton || this.#isValidLink || this.#isButtonInput;
  }

  readonly host = {
    tabIndex: inject(TabIndex),
    disabled: inject(Disabled),
    ariaDisabled: inject(AriaDisabled),
    dataDisabled: inject(DataDisabled),
    role: inject(Role),
    type: inject(Type),
    onKeyDown: inject(OnKeyDown),
    onKeyUp: inject(OnKeyUp),
  } as const;

  readonly disabledInput = input(this.#config.defaults.disabled, {
    alias: 'disabled',
    transform: (v: '' | boolean | 'hard' | 'soft'): boolean | 'soft' => {
      if (isBoolean(v)) return v;
      if (v === 'soft') return 'soft';
      if (v === '' || v === 'hard') return true;
      return false;
    },
  });

  readonly optionsInput = input<DeepPartial<ButtonOptions>>(this.#config.defaults.options, {
    alias: 'options',
  });

  disable(value: boolean | 'soft' = true): void {
    this.innerState.update((s) => ({...s, disabled: value === 'soft' ? 'soft' : Boolean(value)}));
  }

  enable(): void {
    this.innerState.update((s) => ({...s, disabled: false}));
  }

  constructor() {
    super(
      linkedSignal(() => ({
        disabled: this.disabledInput(),
        options: {
          ...this.#config.defaults.options,
          ...this.optionsInput(),
        },
      })),
      {
        transform: (s) => ({
          disabled: !!s.disabled,
          softDisabled: s.disabled === 'soft',
          disabledVariant: s.disabled === 'soft' ? 'soft' : s.disabled ? 'hard' : null,
          options: s.options,
        }),
      },
    );

    this.host.role.append(({next}) => next() ?? (this.#implicitRole ? null : 'button'));
    this.host.type.append(({next}) => next() ?? (this.#isNativeButton ? 'button' : null));

    this.host.tabIndex.append(({next}) => {
      let tabIndex = next();
      if (!this.#isNativeButton && this.state.disabled()) {
        tabIndex = this.state.softDisabled() ? tabIndex : -1;
      }
      return tabIndex ?? 0;
    });

    if (this.#hasDisabledAttribute) {
      this.host.disabled.append(() => this.state.disabled() && !this.state.softDisabled());
    }

    this.host.ariaDisabled.append(({next}) => {
      let ariaDisabled = next();
      if (
        (this.#hasDisabledAttribute && this.state.softDisabled()) ||
        (!this.#hasDisabledAttribute && this.state.disabled())
      ) {
        ariaDisabled = Boolean(this.state.disabled());
      }
      return ariaDisabled;
    });

    this.host.dataDisabled.append(({next}) => {
      let dataDisabled = next();
      const value = this.state.disabledVariant();
      if (value) {
        dataDisabled = value;
      }
      return dataDisabled;
    });

    listener.capture(this.#element, 'click', (event) => {
      if (this.state.options.captureClick() && this.state.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });

    listener.capture(this.#element, 'mousedown', (event) => {
      if (this.state.options.captureMouseDown() && this.state.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });

    listener.capture(this.#element, 'pointerdown', (event) => {
      if (this.state.options.capturePointerDown() && this.state.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });

    this.host.onKeyDown.append(({event, stop, next, stopped}) => {
      if (this.state.softDisabled() && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
      }

      if (this.state.disabled()) {
        stop();
        return;
      }

      next();
      if (stopped()) {
        return;
      }

      const isCurrentTarget = event.target === event.currentTarget;
      const isLink =
        !this.#isNativeButton &&
        isAnchorElement(event.currentTarget as HTMLElement, {validLink: true});
      const shouldClick =
        isCurrentTarget &&
        (this.#isNativeButton ? isButtonElement(event.currentTarget as HTMLElement) : !isLink);

      if (shouldClick && !this.#isNativeButton) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
        }
        if (event.key === 'Enter') {
          this.#element.click();
        }
      }
    });

    this.host.onKeyUp.append(({event, stop, stopped, next}) => {
      if (this.state.disabled()) {
        stop();
        return;
      }

      next();
      if (stopped()) {
        return;
      }

      if (event.target === event.currentTarget && !this.#isNativeButton && event.key === ' ') {
        this.#element.click();
      }
    });
  }
}

@Directive({
  selector: '[terseButton]',
  exportAs: 'terseButton',
  hostDirectives: [
    {directive: TabIndex, inputs: ['tabIndex']},
    {directive: Role, inputs: ['role']},
    {directive: Type, inputs: ['type']},
    Disabled,
    DataDisabled,
    AriaDisabled,
    OnKeyDown,
    OnKeyUp,
  ],
})
export class TerseButton extends ButtonBase {}
