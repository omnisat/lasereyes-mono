import { useAccount } from '@omnisat/lasereyes-react'
import { useEffect, useState } from 'react'
import { ImNewTab } from 'react-icons/im'
import { ClickToCopyNpmInstallPill } from '@/components/ClickToCopyNpmInstallPill'
import { badgeVariants } from '@/components/ui/badge'
import { getPackageVersion } from '@/lib/github'
import { cn } from '@/lib/utils'

export default function Header() {
  const [pkgVersion, setPkgVersion] = useState<string | undefined>()
  const account = useAccount()
  const address = account.address

  useEffect(() => {
    getPackageVersion().then(setPkgVersion)
  }, [])

  return (
    <div className="w-full flex gap-2 flex-col md:flex-row justify-center items-center">
      <img
        src={address ? '/lasereyes_connected.svg' : '/lasereyes_disconnected.svg'}
        className="w-auto h-auto"
        alt={address ? 'Laser Eyes Connected' : 'Laser Eyes Disconnected'}
        width={300}
        height={47}
      />
      <a
        className={cn(
          badgeVariants({ variant: 'outline' }),
          'self-end mb-1.5 text-orange-400 border-orange-500 hover:border-white hover:bg-white hover:text-black transition-all text-md'
        )}
        href="https://github.com/omnisat/lasereyes-mono"
        target="_blank"
        rel="noreferrer"
      >
        {pkgVersion ? `v ${pkgVersion}` : '--'}
      </a>

      <div className="grow" />
      <ClickToCopyNpmInstallPill className="mr-6" />
      <a
        href="https://www.lasereyes.build/docs"
        target="_blank"
        rel="noreferrer"
        className="self-end font-windows text-white flex flex-row gap-2 items-center hover:text-orange-400 transition-all"
      >
        docs
        <ImNewTab />
      </a>
    </div>
  )
}

