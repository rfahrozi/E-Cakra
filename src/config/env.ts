// Baca environment variables dari import.meta.env (Vite)
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  APP_NAME: import.meta.env.VITE_APP_NAME as string ?? 'E-CAKRA',
  APP_VERSION: import.meta.env.VITE_APP_VERSION as string ?? '1.0.0',
}
