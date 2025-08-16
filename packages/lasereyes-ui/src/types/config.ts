import { NetworkType, ProviderType } from "@omnisat/lasereyes";
import { ThemeConfig } from "./theme";

export interface LaserEyesModalConfig {
  networks?: NetworkType[];
  defaultNetwork?: NetworkType;
  providers?: ProviderType[];
  iconUrl?: string;
  theme?: ThemeConfig;
}
