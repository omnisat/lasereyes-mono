export class LaserEyesClientError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'LaserEyesClientError'
    this.code = code
  }
}

export class CapabilityNotFoundError extends LaserEyesClientError {
  constructor(group: string, method: string) {
    super(
      `Method "${method}" not available. Data source missing "${group}" capability.`,
      'CAPABILITY_NOT_FOUND'
    )
    this.name = 'CapabilityNotFoundError'
  }
}

export class DataSourceError extends LaserEyesClientError {
  source: string
  readonly originalCause?: Error
  constructor(message: string, source: string, cause?: Error) {
    super(message, 'DATA_SOURCE_ERROR')
    this.name = 'DataSourceError'
    this.source = source
    this.originalCause = cause
  }
}

export class NetworkMismatchError extends LaserEyesClientError {
  constructor(expected: string, got: string) {
    super(
      `Network mismatch: client is "${expected}" but data source is "${got}"`,
      'NETWORK_MISMATCH'
    )
    this.name = 'NetworkMismatchError'
  }
}

export class PsbtBuildError extends LaserEyesClientError {
  readonly originalCause?: Error
  constructor(message: string, cause?: Error) {
    super(message, 'PSBT_BUILD_ERROR')
    this.name = 'PsbtBuildError'
    this.originalCause = cause
  }
}

export class InsufficientFundsError extends PsbtBuildError {
  constructor(required: number, available: number) {
    super(`Insufficient funds: need ${required} sats, have ${available}`)
    this.name = 'InsufficientFundsError'
  }
}
