import { createContext, useContext } from "react";
import { SIGNET, TESTNET, FRACTAL_TESTNET, MAINNET } from "@kevinoyl/lasereyes";
import { LaserEyesModalConfig } from "../types/config";

export interface LasereyesModalContext {
  isOpen: boolean;
  isLoading: boolean;
  showModal: () => void;
  hideModal: () => void;
  config: LaserEyesModalConfig;
  setConfig: (config: LaserEyesModalConfig) => void;
}

export const laserEyesModalContext = createContext<LasereyesModalContext>({
  isOpen: false,
  isLoading: false,
  showModal: () => { },
  hideModal: () => { },
  config: {
    networks: [MAINNET, TESTNET, SIGNET, FRACTAL_TESTNET],
    defaultNetwork: MAINNET,
  },
  setConfig: () => { },
});

export const useLaserEyesModal = (): LasereyesModalContext => {
  return useContext(laserEyesModalContext);
};
