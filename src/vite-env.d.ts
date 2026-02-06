/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BYPASS_PASSPHRASE?: string
  readonly VITE_MOCK_API?: string
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
