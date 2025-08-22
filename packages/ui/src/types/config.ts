import { NetworkType, ProviderType } from "@kevinoyl/lasereyes";
import { ThemeConfig } from "./theme";

export interface LaserEyesModalConfig {
  networks?: NetworkType[];
  defaultNetwork?: NetworkType;
  providers?: ProviderType[];
  iconUrl?: string;
  theme?: ThemeConfig;
}
