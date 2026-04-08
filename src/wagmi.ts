import { createConfig, http } from 'wagmi'
import { tempo } from 'viem/chains'
import { tempoWallet } from 'accounts/wagmi'

/**
 * Creates a fresh wagmi config. Each call produces a new connector instance,
 * which creates a new Provider → new adapter → new Dialog.iframe() → new DOM elements.
 */
export function makeConfig() {
  return createConfig({
    chains: [tempo],
    connectors: [tempoWallet()],
    transports: { [tempo.id]: http() },
  })
}
