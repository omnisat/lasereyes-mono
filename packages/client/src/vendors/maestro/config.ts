export interface MaestroConfig {
  apiKey: string
  testnetApiKey?: string
  networks?: {
    [key: string]: {
      apiUrl: string
      apiKey: string
    }
  }
}
