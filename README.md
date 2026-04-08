# accounts SDK — duplicate iframe repro

Minimal reproduction of `tempoWallet()` injecting duplicate `<iframe>` elements into the DOM.

## The bug

`Dialog.iframe()` unconditionally creates a new `<dialog>` + `<iframe>` and appends it to `document.body` on every setup call. The wagmi connector's `provider ??=` guard only protects within a single connector instance — it doesn't prevent multiple connector instances from each creating their own iframe.

This happens when:
- **Config is created inside a React component** (re-created every render)
- **React StrictMode** double-mounts in dev → 2 iframes on first load
- **Multiple demo/page components** each create their own `createConfig({ connectors: [tempoWallet()] })`
- **HMR** re-evaluates the module → new connector → new iframe

## Repro steps

```bash
npm install
npm run dev
```

1. Open `http://localhost:5173` — observe "2 iframe(s) in DOM" (StrictMode double-mount)
2. Click "Force re-render" — count increases with each click
3. Inspect DOM: `document.querySelectorAll('dialog[data-tempo-wallet]').length`

## Fix

See [PR #151](https://github.com/tempoxyz/accounts/pull/151) on `tempoxyz/accounts`.
