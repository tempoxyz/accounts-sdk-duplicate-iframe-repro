# accounts SDK — duplicate iframe repro

Minimal reproduction of `tempoWallet()` injecting duplicate `<iframe>` elements into the DOM.

## The bug

`Dialog.iframe()` unconditionally creates a new `<dialog>` + `<iframe>` and appends it to `document.body` on every setup call. The wagmi connector's `provider ??=` guard only protects within a single connector instance — it doesn't prevent multiple connector instances from each creating their own iframe.

This happens when:
- **Multiple demo/page components** each create their own `createConfig({ connectors: [tempoWallet()] })`
- **React StrictMode** double-mounts in dev → 2 iframes on first load
- **Config is created inside a React component** (re-created every render)
- **HMR** re-evaluates the module → new connector → new iframe

This repro simulates the docs site pattern: multiple page components each creating their own wagmi config.

## Repro steps

```bash
npm install
npm run dev
```

1. Open `https://localhost:5199` — observe iframe count climbing (StrictMode + re-renders)
2. Click "Add another page" — adds another config → another iframe
3. Inspect DOM: `document.querySelectorAll('dialog[data-tempo-wallet]').length`

**Note:** We explicitly pass `Dialog.iframe()` to the connector to bypass the SDK's insecure-context check (which falls back to `popup()` on `http://` and would mask the bug).

## Fix

See [PR #151](https://github.com/tempoxyz/accounts/pull/151) on `tempoxyz/accounts`.
