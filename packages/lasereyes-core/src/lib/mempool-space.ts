import axios from 'axios'
import { MAINNET } from '../constants'
import { NetworkType, MempoolTransactionResponse } from '../types'
import { getMempoolSpaceUrl } from './urls'

export async function getTransactionMempoolSpace(
  txId: string,
  network: NetworkType = MAINNET
): Promise<MempoolTransactionResponse> {
  try {
    return await axios
      .get(`${getMempoolSpaceUrl(network)}/api/tx/${txId}`)
      .then((res) => res.data)
  } catch (e: any) {
    throw e
  }
}

export async function getRawTransactionMempoolSpace(
  txId: string,
  network: NetworkType = MAINNET
): Promise<any> {
  try {
    return await axios
      .get(`${getMempoolSpaceUrl(network)}/api/tx/${txId}/raw`)
      .then((res) => res.data)
  } catch (e: any) {
    throw e
  }
}

export const getRecommendedFeesMempoolSpace = async (
  network: NetworkType
): Promise<{
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
}> => {
  return await axios
    .get(`${getMempoolSpaceUrl(network)}/api/v1/fees/recommended`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.data)
}
