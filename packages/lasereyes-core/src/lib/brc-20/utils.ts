
export const getBrc20SendJsonStr = (
  ticker: string,
  amount: number | string
) => {
  return `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`
}
