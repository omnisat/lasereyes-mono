export interface FormattedRune {
    runeId: string
    amount: number
}

export interface FormattedAlkane {
    id: string
    amount: number
    name: string
    symbol: string
}

export interface FormattedBrc20 {
    ticker: string
    amount: number
}

export interface FormattedInscription {
    inscriptionId: string
}

export interface FormattedUTXO {
    txHash: string
    txOutputIndex: number
    btcValue: number
    scriptPubKey: string
    confirmations?: number

    hasRunes: boolean
    runes: FormattedRune[]

    hasAlkanes: boolean
    alkanes: FormattedAlkane[]

    hasInscriptions: boolean
    inscriptions: FormattedInscription[]
}
