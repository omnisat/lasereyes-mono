import ConnectWalletModal from "@/components/modal/ConnectModal";
import { LaserEyesModalConfig } from "@/types/config";
import {
  LaserEyesProvider,
  MAINNET,
  SIGNET,
  TESTNET,
  useLaserEyes,
} from "@omnisat/lasereyes-react";
import {
  ReactNode,
  useCallback,
  useState,
} from "react";
import { laserEyesModalContext } from "./LaserEyesModalContext";



export function LaserEyesModalProvider({
  children,
  config,
}: {
  children: ReactNode | ReactNode[];
  config?: LaserEyesModalConfig;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setConfig] = useState<LaserEyesModalConfig>(
    config || {
      networks: [MAINNET, TESTNET, SIGNET],
      defaultNetwork: MAINNET,
    }
  );
  const { isConnecting, connected } = useLaserEyes();
  const isLoading = isOpen || isConnecting;

  const showModal = useCallback(() => {
    if (!connected) setIsOpen(true);
  }, [connected]);
  const hideModal = useCallback(() => setIsOpen(false), []);

  return (
    <LaserEyesProvider
      config={{
        network: modalConfig.defaultNetwork ?? MAINNET,
      }}
    >
      <laserEyesModalContext.Provider
        value={{
          isOpen,
          isLoading,
          showModal,
          hideModal,
          config: modalConfig,
          setConfig,
        }}
      >
        {children}
        <ConnectWalletModal
          onClose={() => setIsOpen(false)}
          open={isOpen && !connected}
        />
      </laserEyesModalContext.Provider>
    </LaserEyesProvider>
  );
}
