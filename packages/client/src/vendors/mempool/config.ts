export interface MempoolConfig {
  networks?: {
    [key: string]: {
      apiUrl: string
    }
  }
}
