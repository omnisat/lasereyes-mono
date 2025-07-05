import { NetworkType, ProviderType } from "@omnisat/lasereyes-core";

export interface LaserEyesModalConfig {
  networks?: NetworkType[];
  defaultNetwork?: NetworkType;
  providers?: ProviderType[];
  iconUrl?: string;
}
