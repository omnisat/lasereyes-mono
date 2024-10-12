import * as React from 'react'

interface PhantomLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

const PhantomLogo: React.FC<PhantomLogoProps> = ({
  size = 42,
  variant = 'first',
  className,
  ...props
}) => {
  if (variant === 'first') {
    return (
      <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 42 42"
        fill="none"
        {...props}
      >
        <g clipPath="url(#a)">
          <path
            fill="#AB9FF2"
            d="M32 0H10C4.477 0 0 4.477 0 10v22c0 5.523 4.477 10 10 10h22c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10Z"
          />
          <path
            fill="#FFFDF8"
            fillRule="evenodd"
            d="M17.686 27.567c-1.676 2.569-4.484 5.819-8.22 5.819-1.767 0-3.466-.728-3.466-3.887C6 21.454 16.984 9 27.176 9c5.798 0 8.108 4.023 8.108 8.59 0 5.864-3.805 12.568-7.587 12.568-1.2 0-1.79-.659-1.79-1.704 0-.273.046-.568.137-.887-1.291 2.205-3.783 4.25-6.116 4.25-1.698 0-2.559-1.068-2.559-2.568 0-.545.114-1.113.317-1.681Zm8.78-10.135c0 1.331-.786 1.997-1.664 1.997-.892 0-1.664-.666-1.664-1.997s.772-1.996 1.664-1.996c.878 0 1.663.665 1.663 1.996Zm4.99 0c0 1.331-.785 1.997-1.663 1.997-.892 0-1.664-.666-1.664-1.997 0-1.33.772-1.996 1.664-1.996.878 0 1.664.665 1.664 1.996Z"
            clipRule="evenodd"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h42v42H0z" />
          </clipPath>
        </defs>
      </svg>
    )
  }

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      {...props}
    >
      <g clipPath="url(#a)">
        <path
          fill="#FFFDF8"
          d="M32 0H10C4.477 0 0 4.477 0 10v22c0 5.523 4.477 10 10 10h22c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10Z"
        />
        <path
          fill="#AB9FF2"
          fillRule="evenodd"
          d="M17.686 27.567c-1.676 2.569-4.484 5.819-8.22 5.819-1.767 0-3.466-.728-3.466-3.887C6 21.454 16.984 9 27.176 9c5.798 0 8.108 4.023 8.108 8.59 0 5.864-3.805 12.568-7.587 12.568-1.2 0-1.79-.659-1.79-1.704 0-.273.046-.568.137-.887-1.291 2.205-3.783 4.25-6.116 4.25-1.698 0-2.559-1.068-2.559-2.568 0-.545.114-1.113.317-1.681Zm8.78-10.135c0 1.331-.786 1.997-1.664 1.997-.892 0-1.664-.666-1.664-1.997s.772-1.996 1.664-1.996c.878 0 1.663.665 1.663 1.996Zm4.99 0c0 1.331-.785 1.997-1.663 1.997-.892 0-1.664-.666-1.664-1.997 0-1.33.772-1.996 1.664-1.996.878 0 1.664.665 1.664 1.996Z"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h42v42H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export { PhantomLogo }
