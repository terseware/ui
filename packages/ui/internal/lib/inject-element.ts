import {ElementRef, inject} from '@angular/core';

/**
 * Injects the host element ref as `ElementRef<HTMLElement>`.
 */
export function injectElementRef<T = HTMLElement>(): ElementRef<T> {
  return inject<ElementRef<T>>(ElementRef);
}

/**
 * Injects and returns the host native `HTMLElement`.
 */
export function injectElement<T = HTMLElement>(): T {
  return injectElementRef<T>().nativeElement;
}
