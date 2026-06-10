/**
 * Entry point for the React showcase. Standard React 19 mount.
 *
 * Importing `./App` pulls in `./config`, so the config is built (and the
 * adapters loaded) before the first render. `<LaserEyesProvider>` then runs
 * `initialize(config)` in an effect.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')

// StrictMode double-invokes effects in dev, so you'll see initialize → dispose
// → initialize on first mount. That's the provider's lifecycle being exercised
// twice on purpose; it should settle to a single live subscription.
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
