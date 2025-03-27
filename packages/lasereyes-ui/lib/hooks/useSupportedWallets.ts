/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MAGIC_EDEN,
  SUPPORTED_WALLETS,
  useLaserEyes,
} from "@omnisat/lasereyes-react";
import { useMemo } from "react";

export interface WalletInfo {
  label: string;
  connectorId: keyof typeof SUPPORTED_WALLETS;
  installUrl: string;
}

export default function useSupportedWallets() {
  const {
    hasUnisat,
    hasLeather,
    hasMagicEden,
    hasOkx,
    hasOyl,
    hasPhantom,
    hasWizz,
    hasXverse,
    hasOpNet,
    hasOrange,
    hasSparrow,
    connect: connectLaserEyes,
  } = useLaserEyes();
  const hasWallet = useMemo(() => ({
    unisat: hasUnisat,
    xverse: hasXverse,
    oyl: hasOyl,
    [MAGIC_EDEN]: hasMagicEden,
    okx: hasOkx,
    op_net: hasOpNet,
    leather: hasLeather,
    phantom: hasPhantom,
    wizz: hasWizz,
    orange: hasOrange,
    sparrow: hasSparrow,
  }), [hasLeather, hasMagicEden, hasOkx, hasOpNet, hasOrange, hasOyl, hasPhantom, hasSparrow, hasUnisat, hasWizz, hasXverse]);
  const [installedWallets, otherWallets] = useMemo(() => {
    const i: (WalletInfo & {
      connect: () => Promise<string | undefined>;
    })[] = [];
    const o: WalletInfo[] = [];
    Object.keys(SUPPORTED_WALLETS).forEach((e) => {
      const isInstalled = hasWallet[e as keyof typeof hasWallet];
      const wallet = SUPPORTED_WALLETS[e as keyof typeof SUPPORTED_WALLETS];
      const w: WalletInfo = {
        ...wallet,
        connectorId: e as keyof typeof SUPPORTED_WALLETS,
        installUrl: wallet.url,
        label: wallet.name
          .replace(/[-_]/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" "),
      };
      if (isInstalled) {
        i.push({
          ...w,
          connect: async () => {
            try {
              await connectLaserEyes(w.connectorId);
            } catch (e) {
              console.error(e);
              if (e instanceof Error) {
                return e.message;
              } else if ("message" in (e as any)) {
                return `${(e as any).message}`;
              }
              return `${e}`;
            }
          },
        });
      } else {
        o.push(w);
      }
    });
    return [i, o];
  }, [hasWallet, connectLaserEyes]);
  return { installedWallets, otherWallets };
}
