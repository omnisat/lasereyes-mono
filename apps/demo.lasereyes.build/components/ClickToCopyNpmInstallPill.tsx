'use client'
import { cn, truncateString } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'
import { FaCopy } from 'react-icons/fa6'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export const ClickToCopyNpmInstallPill = ({
  className,
}: {
  className?: string
}) => {
  const DEPENDENCY_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun']
  const [dependencyManager, setDependencyManager] = useLocalStorage(
    'preferredDependencyManager',
    DEPENDENCY_MANAGERS[0]
  )
  const [signature, setSignature] = useState(' --')

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setSignature(
      `${dependencyManager} ${dependencyManager === 'yarn' ? 'add' : 'install'} @kevinoyl/lasereyes`
    )
  }, [dependencyManager])

  const setDepManagerAndSignature = (manager: string) => {
    setDependencyManager(manager)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
  }

  return (
    <div
      className={cn(
        badgeVariants({ variant: 'outline' }),
        'self-end font-windows text-xs gap-3 transition-all  text-white select-none border-[#3c393f] p-0 cursor-pointer   ',
        className
      )}
    >
      <span
        className={cn(
          ' flex flex-row gap-2 group  items-center justify-center',
          signature?.length > 0 ? '' : '',
          copied ? 'animate-pulse' : ''
        )}
        onClick={() => copyToClipboard(signature)}
      >
        <span
          className={'pl-4 gap-5 group-hover:text-orange-500 cursor-pointer'}
        >
          {signature?.length > 0 && !copied ? (
            <span className={'flex flex-row gap-1.5'}>
              <span className={'text-orange-500 tracking-wide'}>
                {dependencyManager}
              </span>{' '}
              <span className={'tracking-wide'}>
                {signature.replaceAll(dependencyManager, ' ')}
              </span>
            </span>
          ) : (
            ''
          )}{' '}
          {copied && (
            <span className={'text-orange-500'}>Copied to clipboard</span>
          )}
        </span>
        <FaCopy
          className={cn(
            'group-hover:text-orange-500',
            copied ? 'text-orange-500' : ''
          )}
        />
      </span>
      <div
        className={
          'p-1 px-4 border-l tracking-wide border-[#3c393f] rounded-md text-orange-500 hover:text-white  rounded-r-full'
        }
        onClick={() =>
          setDepManagerAndSignature(
            DEPENDENCY_MANAGERS[
            (DEPENDENCY_MANAGERS.indexOf(String(dependencyManager)) + 1) %
            DEPENDENCY_MANAGERS.length
            ]
          )
        }
      >
        {dependencyManager}
      </div>
    </div>
  )
}
