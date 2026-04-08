import { useEffect, useState, useRef } from 'react'
import { WagmiProvider, useConnect } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { makeConfig } from './wagmi'

const queryClient = new QueryClient()

/**
 * Inner component that triggers connector setup by accessing connectors.
 */
function WalletStatus() {
  const { connectors } = useConnect()
  return (
    <span style={{ color: '#888', fontSize: 14 }}>
      Connector: {connectors[0]?.name ?? 'loading...'}
    </span>
  )
}

/**
 * A single "page" that creates its own wagmi config.
 * Each mount creates a new tempoWallet() → Provider.create() → Dialog.iframe().
 */
function Page({ index }: { index: number }) {
  const configRef = useRef(makeConfig())

  return (
    <div
      style={{
        border: '1px solid #333',
        padding: 12,
        marginTop: 8,
        borderRadius: 4,
      }}
    >
      <strong>Page {index + 1}</strong>
      {' — '}
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={configRef.current}>
          <WalletStatus />
        </WagmiProvider>
      </QueryClientProvider>
    </div>
  )
}

/**
 * BUG REPRO: Multiple components each create their own wagmi config.
 *
 * This simulates the docs site where multiple pages/demos each call
 * createConfig({ connectors: [tempoWallet()] }) independently.
 */
function App() {
  const [pageCount, setPageCount] = useState(1)
  const [iframeCount, setIframeCount] = useState(0)

  useEffect(() => {
    const update = () => {
      const count = document.querySelectorAll('dialog[data-tempo-wallet]').length
      setIframeCount(count)
    }

    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true })

    update()
    const interval = setInterval(update, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return (
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

      <p id="status" style={{ color: iframeCount > 1 ? '#e94560' : '#888' }}>
        {iframeCount > 1
          ? `❌ BUG: ${iframeCount} duplicate iframes detected!`
          : iframeCount === 1
            ? '✅ Only 1 iframe — no duplicates.'
            : '⏳ Waiting for connector setup...'}
      </p>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button
          id="add-page"
          onClick={() => setPageCount((n) => n + 1)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Add another "page" (creates new config + iframe)
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {Array.from({ length: pageCount }, (_, i) => (
          <Page key={i} index={i} />
        ))}
      </div>

      <div style={{ marginTop: 40, color: '#888', maxWidth: 600 }}>
        <h3>What's happening</h3>
        <ul>
          <li>
            Each "page" creates a new <code>createConfig</code> with its own{' '}
            <code>tempoWallet()</code> connector
          </li>
          <li>
            The connector's <code>setup()</code> calls{' '}
            <code>getProvider()</code> → <code>Provider.create()</code> →{' '}
            <code>Dialog.iframe()</code>
          </li>
          <li>
            <code>Dialog.iframe()</code> unconditionally appends a new{' '}
            <code>&lt;dialog&gt;</code> + <code>&lt;iframe&gt;</code> to{' '}
            <code>document.body</code>
          </li>
          <li>
            Click "Add another page" to see the count increase
          </li>
        </ul>
      </div>
    </div>
  )
}

export default App
