export interface SandshrewConfig {
  apiKey?: string
  networks?: {
    [key: string]: {
      apiUrl: string
      apiKey: string
    }
  }
}
