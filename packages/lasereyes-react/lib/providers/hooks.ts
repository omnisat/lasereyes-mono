import { useContext } from 'react'
import { LaserEyesContext } from './context'
import { LaserEyesContextType } from './types'

export const useLaserEyes = (): LaserEyesContextType => {
  return useContext(LaserEyesContext)
}
