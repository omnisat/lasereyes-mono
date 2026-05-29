export function isBase64(str: string): boolean {
  if (str === '' || str.trim() === '') return false
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}
