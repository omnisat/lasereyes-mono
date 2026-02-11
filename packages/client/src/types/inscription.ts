export interface Inscription {
  id: string
  inscriptionId: string
  content: string
  number: number
  address: string
  contentType: string
  output: string
  location: string
  genesisTransaction: string
  height: number
  preview: string
  outputValue: number
  offset?: number
}

export interface InscriptionInfo {
  data: {
    inscription_id: string
    inscription_number: number
    created_at: number
    content_type: string
    content_body_preview: string
    content_length: number
    collection_symbol: string | null
  }
  last_updated: {
    block_hash: string
    block_height: number
  }
}
