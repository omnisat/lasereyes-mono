import { clsx } from 'clsx'
import { FaExternalLinkAlt } from 'react-icons/fa'
import ClickToCopy from '@/components/ClickToCopy'
import { truncateString } from '@/lib/utils'

interface FieldProps {
  label: string
  value?: string
}

export default function Field({ label, value }: FieldProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-black text-orange-400">{label}</span>
      <span
        className={clsx(
          'text-lg flex flex-row gap-2 items-center justify-center',
          value ? 'text-white' : 'text-gray-500'
        )}
      >
        {value && (
          <a
            href={`https://mempool.space/address/${value}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-row items-center gap-1"
          >
            <FaExternalLinkAlt className="h-3 w-3 text-gray-500" />
          </a>
        )}
        {value ? truncateString(value, 24) : '--'}
        {value && <ClickToCopy value={value} />}
      </span>
    </div>
  )
}

