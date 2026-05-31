/// <reference types="vite/client" />
declare module '*.png' { const src: string; export default src }
declare module '*.svg' { const src: string; export default src }
declare module '*.jpg' { const src: string; export default src }

declare global {
  interface Window {
    SaaSBrowser?: {
      requestReview: () => void
    }
  }
}
export {}
