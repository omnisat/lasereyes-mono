import type { NetworkType, ProviderType } from '@omnisat/lasereyes'
import type { ThemeConfig } from './theme'

export interface LaserEyesModalConfig {
  networks?: NetworkType[]
  defaultNetwork?: NetworkType
  providers?: ProviderType[]
  iconUrl?: string
  theme?: ThemeConfig
}
