type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const isDev = import.meta.env.DEV

const logger = {
  info:  (...args: unknown[]) => isDev && console.info('[E-CAKRA]', ...args),
  warn:  (...args: unknown[]) => isDev && console.warn('[E-CAKRA]', ...args),
  error: (...args: unknown[]) => console.error('[E-CAKRA]', ...args),
  debug: (...args: unknown[]) => isDev && console.debug('[E-CAKRA]', ...args),
}

export default logger
