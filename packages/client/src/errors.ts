/**
 * Base error class for all @omnisat/lasereyes-client errors.
 *
 * All errors thrown by the client library extend this class, allowing consumers
 * to catch any client error with a single `catch (e instanceof LaserEyesClientError)`.
 *
 * @remarks
 * The {@link LaserEyesClientError.code | code} property provides a machine-readable error identifier.
 */
export class LaserEyesClientError extends Error {
  /** Machine-readable error code (e.g., `'NETWORK_MISMATCH'`, `'PSBT_BUILD_ERROR'`). */
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'LaserEyesClientError'
    this.code = code
  }
}

/**
 * Thrown when a requested method is not available on the data source because
 * the required capability group has not been added via `.extend()`.
 *
 * @remarks
 * Error code: `'CAPABILITY_NOT_FOUND'`
 */
export class CapabilityNotFoundError extends LaserEyesClientError {
  /**
   * @param group - The name of the missing capability group (e.g., `'rune'`, `'inscription'`)
   * @param method - The method that was called but not available
   */
  constructor(group: string, method: string) {
    super(
      `Method "${method}" not available. Data source missing "${group}" capability.`,
      'CAPABILITY_NOT_FOUND'
    )
    this.name = 'CapabilityNotFoundError'
  }
}

/**
 * Thrown when a vendor data source encounters an error during an API call.
 *
 * @remarks
 * Error code: `'DATA_SOURCE_ERROR'`
 *
 * The {@link DataSourceError.source | source} property identifies which vendor produced the error,
 * and {@link DataSourceError.originalCause | originalCause} preserves the underlying exception.
 */
export class DataSourceError extends LaserEyesClientError {
  /** The vendor name that produced this error (e.g., `'mempool'`, `'sandshrew'`, `'maestro'`). */
  source: string
  /** The original error that caused this data source error, if available. */
  readonly originalCause?: Error
  /**
   * @param message - Human-readable error description
   * @param source - The vendor or data source name that produced the error
   * @param cause - The original underlying error, if any
   */
  constructor(message: string, source: string, cause?: Error) {
    super(message, 'DATA_SOURCE_ERROR')
    this.name = 'DataSourceError'
    this.source = source
    this.originalCause = cause
  }
}

/**
 * Thrown when a client or merge operation detects that two components are configured
 * for different Bitcoin networks.
 *
 * @remarks
 * Error code: `'NETWORK_MISMATCH'`
 */
export class NetworkMismatchError extends LaserEyesClientError {
  /**
   * @param expected - The expected network identifier
   * @param got - The actual network identifier that was found
   */
  constructor(expected: string, got: string) {
    super(
      `Network mismatch: client is "${expected}" but data source is "${got}"`,
      'NETWORK_MISMATCH'
    )
    this.name = 'NetworkMismatchError'
  }
}

/**
 * Thrown when PSBT construction fails due to invalid parameters, missing data,
 * or transaction building errors.
 *
 * @remarks
 * Error code: `'PSBT_BUILD_ERROR'`
 */
export class PsbtBuildError extends LaserEyesClientError {
  /** The original error that caused this PSBT build failure, if available. */
  readonly originalCause?: Error
  /**
   * @param message - Human-readable description of the PSBT build failure
   * @param cause - The original underlying error, if any
   */
  constructor(message: string, cause?: Error) {
    super(message, 'PSBT_BUILD_ERROR')
    this.name = 'PsbtBuildError'
    this.originalCause = cause
  }
}

/**
 * Thrown when the available UTXOs cannot cover the required amount plus transaction fees.
 *
 * @remarks
 * Extends {@link PsbtBuildError} with error code `'PSBT_BUILD_ERROR'`.
 */
export class InsufficientFundsError extends PsbtBuildError {
  /**
   * @param required - The total satoshis needed (amount + estimated fees)
   * @param available - The total satoshis available in the selected UTXOs
   */
  constructor(required: number, available: number) {
    super(`Insufficient funds: need ${required} sats, have ${available}`)
    this.name = 'InsufficientFundsError'
  }
}
