/**
 * Creates a fake object that can be used as a stand-in for a real object in
 * tests. The fake object will throw an error when accessing any property that
 * is not defined in the object passed to the function.
 * @param name - The name of the fake object. Used in error messages.
 *  The convention is to use the word "Fake" followed by the name of the object.
 *  This allows developers to easily locate the fake object in the codebase.
 * @param object - The implementation of the fake object.
 * @returns A fake object.
 */
export function fake<TSubject extends object>(
  name: `${'' | `${string}.`}Fake${string}`,
  object: Partial<TSubject>,
): TSubject {
  // This proxy object throws an error when accessing any property that is not
  // defined in the object passed to the function.
  const proxy = new Proxy(object, {
    get(target, key) {
      if (key in target) {
        return target[key as keyof TSubject]
      }
      const stringKey = String(key)
      throw new Error(
        `A ${name} does not support property "${stringKey}". ` +
          `Consider adding it to the fake object.`,
      )
    },
  })
  return proxy as TSubject
}
