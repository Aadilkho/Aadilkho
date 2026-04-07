// After deploying backend/ to Vercel, set EXPO_PUBLIC_PROXY_URL in your .env file
// e.g. EXPO_PUBLIC_PROXY_URL=https://cariq-backend.vercel.app
export const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL ?? '';
