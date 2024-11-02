export const isBase64 = (str: string): boolean => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
  return base64Regex.test(str)
}

export const isHex = (str: string): boolean => {
  const hexRegex = /^[a-fA-F0-9]+$/
  return hexRegex.test(str)
}
