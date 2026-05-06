/**
 * Unisat wallet connector.
 *
 * @module connectors/unisat
 */

import { UnisatAdapter } from '../adapters/unisat'
import type { BitcoinProvider } from '../types'
import type { ConnectorConfig, CreateConnectorFn } from '../types/connector'
import { BaseConnector } from './base'

/**
 * Unisat Wallet connector.
 *
 * @remarks
 * Wraps the Unisat adapter and provides lifecycle management.
 * Unisat provides a single address that serves as both payment and ordinals.
 */
export class UnisatConnector extends BaseConnector {
  getTarget: () => Target
  constructor(params: UnisatConnectorParams) {
    super(params.config)
    const defaultTarget = {
      id: 'unisat',
      name: 'Unisat',
      getObject(window): object | null {
        return window.unisat
      },
    } satisfies Target
    this.getTarget = () => params.target ?? defaultTarget
  }

  get id(): string {
    return this.getTarget().id
  }

  get name(): string {
    return this.getTarget().name
  }

  get icon(): string | undefined {
    return this.getTarget().icon
  }

  get rdns(): string | undefined {
    return this.getTarget().rdns
  }

  getProvider(): BitcoinProvider | null {
    const unisatObject = this.getTarget().getObject(window)
    if (!unisatObject) {
      return null
    }
    return new UnisatAdapter(unisatObject)
  }
}

/**
 * Factory function to create Unisat connector.
 *
 * @returns Connector factory function
 *
 * @example
 * ```ts
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 * import { unisatConnector } from '@omnisat/lasereyes-core/connectors'
 *
 * const core = createLaserEyesCore({
 *   connectors: [unisatConnector()]
 * })
 * ```
 */
export function unisatLikeConnector(params?: { target?: Target }): CreateConnectorFn {
  return config => new UnisatConnector({ config, target: params?.target })
}

export function unisat(): CreateConnectorFn {
  return unisatLikeConnector({
    target: { id: 'unisat', name: 'Unisat', getObject: window => window.unisat },
  })
}

export function binance(): CreateConnectorFn {
  return unisatLikeConnector({
    target: { id: 'binance', name: 'Binance', getObject: window => window.binancew3w.bitcoin },
  })
}

export function wizz(): CreateConnectorFn {
  return unisatLikeConnector({
    target: { id: 'wizz', name: 'Wizz', getObject: window => window.wizz },
  })
}

type Target = {
  id: string
  name: string
  icon?: string
  rdns?: string
  getObject(window: any): object | null
}

type UnisatConnectorParams = {
  target?: Target
  config: ConnectorConfig
}
