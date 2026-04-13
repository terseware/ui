import {Directive, forwardRef, inject, linkedSignal} from '@angular/core';
import {IdAttribute, TabIndex, type OrientationValue} from '@terse-ui/core/attributes';
import {Focus} from '@terse-ui/core/interactions';
import {State} from '@terse-ui/core/utils';
import {RovingFocus} from './roving-focus';

interface RovingFocusItemInnerState {
  enabled: boolean;
  wrap: boolean;
  homeEnd: boolean;
}

export interface RovingFocusItemState extends RovingFocusItemInnerState {
  orientation: OrientationValue;
}

@Directive({
  exportAs: 'rovingFocusItem',
  hostDirectives: [IdAttribute, TabIndex, Focus],
})
export class RovingFocusItem extends State<RovingFocusItemInnerState, RovingFocusItemState> {
  readonly #parent = inject(
    forwardRef(() => RovingFocus),
    {optional: true},
  );

  readonly #focused = inject(Focus);
  readonly isActive = computed(() => this.#focused.state);

  constructor() {
    super(
      linkedSignal(() => ({
        enabled: this.enabled(),
        wrap: this.wrap(),
        homeEnd: this.homeEnd(),
      })),
      {
        transform: (value: RovingFocusItemInnerState) => ({
          ...value,
          orientation: this.host.orientation.result.value(),
        }),
      },
    );
  }

  patchState(state: Partial<RovingFocusItemInnerState>): void {
    this.#innerState.update((s) => ({...s, ...state}));
  }
}
