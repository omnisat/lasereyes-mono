import {
  BINANCE,
  KEPLR,
  LEATHER,
  OKX,
  OP_NET,
  ORANGE,
  OYL,
  PHANTOM,
  TOKEO,
  UNISAT,
  WIZZ,
  XVERSE,
} from '@omnisat/lasereyes-core'
import { BinanceLogo } from './binance.tsx'
import KeplrLogo from './keplr.tsx'
import { LeatherLogo } from './leather.tsx'
import { OkxLogo } from './okx.tsx'
import OpNetIcon from './op_net.tsx'
import OrangeLogo from './orange.tsx'
import { OylLogo } from './oyl.tsx'
import { PhantomLogo } from './phantom.tsx'
import { TokeoLogo } from './tokeo.tsx'
import { UnisatLogo } from './unisat.tsx'
import { WizzLogo } from './wizz.tsx'
import { XverseLogo } from './xverse.tsx'

const WalletIcon = ({
  size,
  className,
  variant,
  walletName,
}: {
  size: number
  className?: string
  variant?: 'first' | 'second'
  walletName: string
}) => {
  if (walletName === XVERSE) {
    return <XverseLogo size={size} className={className} variant={variant} />
  } else if (walletName === WIZZ) {
    return <WizzLogo size={size} className={className} variant={variant} />
  } else if (walletName === LEATHER) {
    return <LeatherLogo size={size} className={className} variant={variant} />
  } else if (walletName === OKX) {
    return <OkxLogo size={size} className={className} variant={variant} />
  } else if (walletName === PHANTOM) {
    return <PhantomLogo size={size} className={className} variant={variant} />
  } else if (walletName === UNISAT) {
    return <UnisatLogo size={size} className={className} variant={variant} />
  } else if (walletName === OYL) {
    return <OylLogo size={size} className={className} variant={variant} />
  } else if (walletName === ORANGE) {
    return <OrangeLogo size={size} className={className} variant={variant} />
  } else if (walletName === OP_NET) {
    return <OpNetIcon size={size} className={className} variant={variant} />
  } else if (walletName === TOKEO) {
    return <TokeoLogo size={size} className={className} variant={variant} />
  } else if (walletName === KEPLR) {
    return <KeplrLogo size={size} className={className} variant={variant} />
  } else if (walletName === BINANCE) {
    return <BinanceLogo size={size} className={className} variant={variant} />
  } else {
    return <OylLogo size={size} className={className} variant={variant} />
  }
}

export { WalletIcon }
