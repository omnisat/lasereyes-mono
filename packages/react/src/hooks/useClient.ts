import type { LaserEyesClient } from "@kevinoyl/lasereyes-core"
import { useLaserEyes } from "../providers/hooks"

export function useClient(): LaserEyesClient | null {
  return useLaserEyes(x => x.client)
}
