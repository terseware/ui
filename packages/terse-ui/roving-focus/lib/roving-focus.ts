import {booleanAttribute, Directive, inject, input, linkedSignal} from '@angular/core';
import {Orientation, type OrientationValue} from '@terse-ui/core/attributes';
import {StatePipeline} from '@terse-ui/core/utils';

interface RovingFocusInnerState {
  enabled: boolean;
  wrap: boolean;
  homeEnd: boolean;
}

export interface RovingFocusState extends RovingFocusInnerState {
  orientation: OrientationValue;
}

@Directive({
  exportAs: 'rovingFocus',
  hostDirectives: [Orientation],
})
export class RovingFocus extends StatePipeline<RovingFocusInnerState, RovingFocusState> {
  readonly enabled = input(true, {alias: 'rovingFocus', transform: booleanAttribute});
  readonly wrap = input(true, {alias: 'rovingFocusWrap', transform: booleanAttribute});
  readonly homeEnd = input(true, {alias: 'rovingFocusHomeEnd', transform: booleanAttribute});

  readonly host = {
    orientation: inject(Orientation),
  } as const;

  constructor() {
    super(
      linkedSignal(() => ({
        enabled: this.enabled(),
        wrap: this.wrap(),
        homeEnd: this.homeEnd(),
      })),
      {
        transform: (value: RovingFocusInnerState) => ({
          ...value,
          orientation: this.host.orientation.state.value(),
        }),
      },
    );
  }

  patchState(state: Partial<RovingFocusInnerState>): void {
    this.innerState.update((s) => ({...s, ...state}));
  }
}
