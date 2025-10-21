import * as React from 'react'

interface UniversalLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  variant?: 'first' | 'second'
}

/**
 * Logo SVG du wallet Universal
 *
 * ⚠️ PERSONNALISATION REQUISE :
 * Remplacez ce SVG par le vrai logo de votre wallet.
 *
 * Pour obtenir le SVG :
 * 1. Exportez votre logo au format SVG depuis Figma/Illustrator/etc.
 * 2. Optimisez-le avec SVGO (https://jakearchibald.github.io/svgomg/)
 * 3. Copiez le code SVG ici
 * 4. Remplacez width/height par {size}
 * 5. Ajoutez {...props} pour permettre la personnalisation
 */
const UniversalLogo: React.FC<UniversalLogoProps> = ({
  size = 42,
  variant = 'first',
  className,
  ...props
}) => {
  const getVariant = () => {
    switch (variant) {
      case 'first':
        return <circle cx="50" cy="50" r="45" fill="#FF6B35" />
      case 'second':
        return (
          <rect x="10" y="10" width="80" height="80" rx="20" fill="#4A90E2" />
        )
      default:
        return <circle cx="50" cy="50" r="45" fill="#FF6B35" />
    }
  }

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Universal Wallet"
      {...props}
    >
      <title>Universal Wallet</title>
      {/* 🔧 REMPLACEZ CE PLACEHOLDER PAR VOTRE VRAI LOGO SVG */}

      {/* Exemple de cercle avec un "U" - À REMPLACER */}
      {getVariant()}
      <text
        x="50"
        y="50"
        fontSize="48"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        U
      </text>

      {/* Ajoutez votre vrai SVG ici */}
    </svg>
  )
}

export { UniversalLogo }
