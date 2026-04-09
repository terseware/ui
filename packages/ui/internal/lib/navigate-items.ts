/**
 * Navigates a list of items, skipping disabled ones with wrapping modular arithmetic.
 *
 * @returns The resolved index, or `-1` if all items are disabled or the list is empty.
 *
 * @example
 * ```ts
 * const idx = navigateItems(items, currentIndex, 'next', (item) => item.disabled);
 * if (idx !== -1) activeIndex.set(idx);
 * ```
 */
export function navigateItems<T>(
  items: readonly T[],
  currentIndex: number,
  direction: 'next' | 'prev' | 'first' | 'last',
  isDisabled: (item: T) => boolean,
): number {
  if (items.length === 0) {
    return -1;
  }

  let startIndex: number;
  let step: 1 | -1;

  switch (direction) {
    case 'next':
      startIndex = currentIndex + 1;
      step = 1;
      break;
    case 'prev':
      startIndex = currentIndex - 1;
      step = -1;
      break;
    case 'first':
      startIndex = 0;
      step = 1;
      break;
    case 'last':
      startIndex = items.length - 1;
      step = -1;
      break;
  }

  let idx = ((startIndex % items.length) + items.length) % items.length;
  let attempts = 0;

  while (attempts < items.length) {
    const item = items[idx];
    if (item !== undefined && !isDisabled(item)) {
      return idx;
    }
    idx = (((idx + step) % items.length) + items.length) % items.length;
    attempts++;
  }

  // All items disabled
  return -1;
}
