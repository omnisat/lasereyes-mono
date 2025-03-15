export function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(
  obj: Record<string, unknown>,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
