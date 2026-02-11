function checkProperties(a: { [x: string]: any }, b: { [x: string]: any }) {
  return Object.keys(a).every(
    p =>
      Object.hasOwn(b, p) &&
      (b[p] === a[p] ||
        (typeof a[p] === 'number' &&
          typeof b[p] === 'number' &&
          Number.isNaN(b[p]) &&
          Number.isNaN(a[p])))
  )
}

// Compare a to b and b to a
export function compareValues(a: any, b: any) {
  if (typeof a === 'object' && typeof b === 'object') {
    return checkProperties(a, b) && checkProperties(b, a)
  }
  return a === b
}
