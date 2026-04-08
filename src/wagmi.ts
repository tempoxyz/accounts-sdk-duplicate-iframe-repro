import { createConfig, http } from 'wagmi'
import { tempo } from 'viem/chains'
import { tempoWallet } from 'accounts/wagmi'
import { Dialog } from 'accounts'

/**
 * Creates a fresh wagmi config. Each call produces a new connector instance,
 * which creates a new Provider → new adapter → new Dialog.iframe() → new DOM elements.
 *
 * We explicitly pass Dialog.iframe() to bypass the insecure-context check
 * (http://localhost is treated as insecure by the SDK, which would fall back
 * to popup() and mask the iframe duplication bug).
 */
export function makeConfig() {
  return createConfig({
    chains: [tempo],
    connectors: [
      tempoWallet({
        dialog: Dialog.iframe(),
      }),
    ],
    transports: { [tempo.id]: http() },
  })
}
