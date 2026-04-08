import { useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { makeConfig } from './wagmi'

const queryClient = new QueryClient()

/**
 * BUG REPRO: Config created inside the component body.
 *
 * Every render calls makeConfig() → tempoWallet() → Provider.create() →
 * Dialog.iframe() → injects a new <dialog> + <iframe> into document.body.
 *
 * React StrictMode double-mounts in dev, so you get 2 iframes on first load.
 * Each re-render adds another.
 */
function App() {
  // ❌ Config inside component — re-created every render
  const config = makeConfig()

  const [iframeCount, setIframeCount] = useState(0)
  const [, forceRender] = useState(0)

  useEffect(() => {
    const update = () => {
      const count = document.querySelectorAll('dialog[data-tempo-wallet]').length
      setIframeCount(count)
    }

    // Observe body for new dialog elements
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true })
    update()

    return () => observer.disconnect()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h1>accounts SDK — duplicate iframe repro</h1>

          <div
            id="iframe-count"
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: iframeCount > 1 ? '#e94560' : '#0f0',
              margin: '20px 0',
            }}
          >
            {iframeCount} iframe(s) in DOM
          </div>

          <p style={{ color: iframeCount > 1 ? '#e94560' : '#888' }}>
            {iframeCount > 1
              ? '❌ BUG: Multiple iframes detected!'
              : '✅ Only 1 iframe — no duplicates.'}
          </p>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button
              id="force-render"
              onClick={() => forceRender((n) => n + 1)}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              Force re-render (adds another iframe)
            </button>
          </div>

          <div style={{ marginTop: 40, color: '#888', maxWidth: 600 }}>
            <h3>What's happening</h3>
            <ul>
              <li>
                <code>makeConfig()</code> is called inside the component body,
                so every render creates a new wagmi config
              </li>
              <li>
                Each config instantiates a new <code>tempoWallet()</code>{' '}
                connector → new <code>Provider.create()</code> → new{' '}
                <code>Dialog.iframe()</code>
              </li>
              <li>
                React StrictMode double-mounts in dev, producing 2 iframes on
                first load
              </li>
              <li>
                Each "Force re-render" click creates yet another iframe
              </li>
            </ul>
          </div>
        </div>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default App
