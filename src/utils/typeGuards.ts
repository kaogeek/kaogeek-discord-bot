/**
 * Checks if an item is included in an array.
 * @param item The item to check for inclusion in the array.
 * @param array The array to search for the item.
 * @returns A type guard indicating if the item is of type A.
 */
export const isInArray = <T, A extends T>(
  item: T,
  array: ReadonlyArray<A>,
): item is A => array.includes(item as A)
