import { DataSourceError } from '../../errors'

export interface RpcResponse {
  jsonrpc: string
  id: number | string
  result: any
}

export class SandshrewRpcClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async call(method: string, params: unknown): Promise<RpcResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: method,
          method,
          params,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return (await response.json()) as RpcResponse
    } catch (error) {
      throw new DataSourceError(
        `Sandshrew RPC error: ${error instanceof Error ? error.message : String(error)}`,
        'sandshrew',
        error instanceof Error ? error : undefined
      )
    }
  }

  async multicall(calls: unknown[]): Promise<RpcResponse[]> {
    const response = await this.call('sandshrew_multicall', calls)
    return response.result
  }
}
