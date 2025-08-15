import type { LaserEyesClient } from "@omnisat/lasereyes-core"
import { useLaserEyes } from "../providers/hooks"

export default function useClient(): LaserEyesClient | null {
  const client = useLaserEyes(({ client }) => client)

  return client
}
