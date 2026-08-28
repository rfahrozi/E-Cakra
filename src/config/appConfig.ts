import { APP_NAME, APP_VERSION, API_BASE_URL } from './constants'

export const appConfig = {
  name: APP_NAME,
  version: APP_VERSION,
  apiBaseUrl: API_BASE_URL,
  defaultLanguage: 'id',
  sessionTimeout: 60 * 60 * 1000, // 1 jam dalam ms
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
}
