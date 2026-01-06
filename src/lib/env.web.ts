/**
 * Web-specific environment variable access
 * This file is only used on web builds (Vite)
 */

export const getEnv = (key: string): string | undefined => {
  // @ts-ignore - import.meta.env is available in Vite
  const env = import.meta.env
  return env?.[key as keyof typeof env] as string | undefined
}

export const isDev = (): boolean => {
  // @ts-ignore - import.meta.env is available in Vite
  return import.meta.env?.DEV === true || import.meta.env?.MODE === 'development'
}
