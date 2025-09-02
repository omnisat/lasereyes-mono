export class WalletNotInstalledError extends Error {
  constructor(readonly walletName: string) {
    super(`Wallet '${walletName}' is not installed`)
  }
}

export class NoAccountFoundError extends Error {
  constructor(readonly walletName: string) {
    super(`No accounts found for '${walletName}'`)
  }
}

export class RequestRejectedError extends Error {
  constructor(readonly request: string, readonly walletName?: string) {
    super(`Request '${request}' rejected by wallet '${walletName ?? ''}'`)
  }
}

export class WalletNotConnectedError extends Error {
  constructor(readonly walletName: string) {
    super(`Wallet '${walletName}' not connected`)
  }
}

export class TransactionCreateFailError extends Error {
  constructor(readonly tx: string, readonly walletName?: string,) {
    super(`Failed to create transaction${walletName ? ` (wallet: ${walletName})` : ''}`)
  }
}
