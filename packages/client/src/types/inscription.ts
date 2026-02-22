/**
 * An Ordinal inscription as returned by listing endpoints.
 */
export interface Inscription {
  /** Internal identifier. */
  id: string
  /** The full inscription ID (format: `txid` + `i` + `index`). */
  inscriptionId: string
  /** The inscription content URL or data. */
  content: string
  /** The inscription number in global ordering. */
  number: number
  /** The address currently holding this inscription. */
  address: string
  /** The MIME content type of the inscription (e.g., `"image/png"`, `"text/plain"`). */
  contentType: string
  /** The current UTXO output holding this inscription (`txid:vout`). */
  output: string
  /** The current location of the inscription (`txid:vout:offset`). */
  location: string
  /** The transaction ID of the inscription's genesis (creation) transaction. */
  genesisTransaction: string
  /** The block height at which this inscription was created. */
  height: number
  /** URL to a preview rendering of the inscription content. */
  preview: string
  /** The satoshi value of the output containing this inscription. */
  outputValue: number
  /** The byte offset of the inscription within the output, if applicable. */
  offset?: number
}

/**
 * Detailed metadata about an inscription, as returned by info endpoints.
 */
export interface InscriptionInfo {
  /** The inscription data fields. */
  data: {
    /** The full inscription ID. */
    inscription_id: string
    /** The inscription number in global ordering. */
    inscription_number: number
    /** UNIX timestamp of when the inscription was created. */
    created_at: number
    /** The MIME content type of the inscription. */
    content_type: string
    /** A preview/snippet of the inscription's content body. */
    content_body_preview: string
    /** The total content length in bytes. */
    content_length: number
    /** The collection symbol this inscription belongs to, or `null`. */
    collection_symbol: string | null
  }
  /** Information about when this data was last indexed. */
  last_updated: {
    /** The block hash at the time of last indexing. */
    block_hash: string
    /** The block height at the time of last indexing. */
    block_height: number
  }
}
