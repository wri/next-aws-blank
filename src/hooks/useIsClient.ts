'use client'

import { useSyncExternalStore } from 'react'

// Module-level stable references avoid unnecessary resubscriptions on each render
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Returns `true` once the component has hydrated on the client, `false` during
 * server-side rendering and the initial client render (before hydration).
 *
 * Using module-level `subscribe`/`getSnapshot` references keeps the
 * `useSyncExternalStore` subscription stable across renders.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
