/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MAGIC_EDEN,
  ProviderType,
  SUPPORTED_WALLETS,
  useLaserEyes,
} from '@kevinoyl/lasereyes'
import { useMemo } from 'react'
import useModalConfig from './useModalConfig'

export interface WalletInfo {
  label: string
  connectorId: keyof typeof SUPPORTED_WALLETS
  installUrl: string
}

export default function useSupportedProviders() {
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
    hasTokeo,
    hasKeplr,
    connect: connectLaserEyes,
  } = useLaserEyes()
  const config = useModalConfig()
  const allowedProviders = config.providers ?? Object.keys(SUPPORTED_WALLETS) as ProviderType[]
  const hasWallet: Record<keyof typeof SUPPORTED_WALLETS, boolean> = useMemo(
    () => ({
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
      tokeo: hasTokeo,
      keplr: hasKeplr,
    }),
    [
      hasLeather,
      hasMagicEden,
      hasOkx,
      hasOpNet,
      hasOrange,
      hasOyl,
      hasPhantom,
      hasSparrow,
      hasTokeo,
      hasUnisat,
      hasWizz,
      hasXverse,
      hasKeplr,
    ]
  )
  const [installedWallets, otherWallets] = useMemo(() => {
    console.log("hasWallet", hasWallet)
    console.log("connectLaserEyes", connectLaserEyes)
    const i: (WalletInfo & {
      connect: () => Promise<string | undefined>
    })[] = []
    const o: WalletInfo[] = []
    Object.keys(SUPPORTED_WALLETS).filter(e => allowedProviders?.includes(e as ProviderType)).forEach((e) => {
      const isInstalled = hasWallet[e as keyof typeof hasWallet]
      const wallet = SUPPORTED_WALLETS[e as keyof typeof SUPPORTED_WALLETS]
      const w: WalletInfo = {
        ...wallet,
        connectorId: e as keyof typeof SUPPORTED_WALLETS,
        installUrl: wallet.url,
        label: wallet.name
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' '),
      }
      if (isInstalled) {
        i.push({
          ...w,
          connect: async () => {
            try {
              await connectLaserEyes(w.connectorId)
            } catch (e) {
              console.error(e)
              if (e instanceof Error) {
                return e.message
              } else if ('message' in (e as any)) {
                return `${(e as any).message}`
              }
              return `${e}`
            }
          },
        })
      } else {
        o.push(w)
      }
    })
    return [i, o]
  }, [hasWallet, connectLaserEyes, allowedProviders])
  return { installedWallets, otherWallets }
}
