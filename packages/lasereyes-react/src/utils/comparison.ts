function checkProperties(a: { [x: string]: any }, b: { [x: string]: any }) {
  return Object.keys(a).every(function (p) {
    return (
      Object.prototype.hasOwnProperty.call(b, p) &&
      (b[p] === a[p] ||
        (typeof a[p] == 'number' &&
          typeof b[p] == 'number' &&
          isNaN(b[p]) &&
          isNaN(a[p])))
    )
  })
}

// Compare a to b and b to a
export function compareValues(a: any, b: any) {
  if (typeof a === 'object' && typeof b === 'object') {
    return checkProperties(a, b) && checkProperties(b, a)
  }
  return a === b
}
