/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_BASE_RATE_PER_HOUR: string
  readonly VITE_TRAVEL_RATE_PER_KM: string
  readonly VITE_FINDERS_FEE_PERCENTAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}
