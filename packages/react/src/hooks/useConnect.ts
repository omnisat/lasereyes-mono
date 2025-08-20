import { useLaserEyes } from "../providers/hooks"

export function useConnect() {
  return useLaserEyes(x => x.connect)
}
