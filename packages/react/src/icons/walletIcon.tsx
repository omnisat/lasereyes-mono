import { WizzLogo } from './wizz.tsx'
import { XverseLogo } from './xverse.tsx'
import { LeatherLogo } from './leather.tsx'
import { MagicEdenLogo } from './magiceden.tsx'
import { OkxLogo } from './okx.tsx'
import { PhantomLogo } from './phantom.tsx'
import { UnisatLogo } from './unisat.tsx'
import { TokeoLogo } from './tokeo.tsx'
import { OylLogo } from './oyl.tsx'
import OrangeLogo from './orange.tsx'
import OpNetIcon from './op_net.tsx'
import SparrowLogo from './sparrow.tsx'
import {
  ProviderType,
  XVERSE,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  UNISAT,
  WIZZ,
  ORANGE,
  OYL,
  OP_NET,
  SPARROW,
  TOKEO,
  KEPLR,
} from '@kevinoyl/lasereyes-core'
import KeplrLogo from './keplr.tsx'

const WalletIcon = ({
  size,
  className,
  variant,
  walletName,
}: {
  size: number
  className?: string
  variant?: 'first' | 'second'
  walletName: ProviderType
}) => {
  if (walletName === XVERSE) {
    return <XverseLogo size={size} className={className} variant={variant} />
  } else if (walletName === WIZZ) {
    return <WizzLogo size={size} className={className} variant={variant} />
  } else if (walletName === LEATHER) {
    return <LeatherLogo size={size} className={className} variant={variant} />
  } else if (walletName === MAGIC_EDEN) {
    return <MagicEdenLogo size={size} className={className} variant={variant} />
  } else if (walletName === OKX) {
    return <OkxLogo size={size} className={className} variant={variant} />
  } else if (walletName === SPARROW) {
    return <SparrowLogo size={size} className={className} variant={variant} />
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
  } else {
    return <OylLogo size={size} className={className} variant={variant} />
  }
}

export { WalletIcon }
