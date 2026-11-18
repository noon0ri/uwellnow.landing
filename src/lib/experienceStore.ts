import { useSyncExternalStore } from 'react'
import { expReducer, initialExp, type ExpAction, type ExpState } from './experienceMachine'

// Module store: shared by the Experience section and the 3D scene (Cup, display tracker).
let state: ExpState = initialExp
const subs = new Set<() => void>()

export function dispatch(a: ExpAction) {
  const next = expReducer(state, a)
  if (next === state) return
  state = next
  subs.forEach(f => f())
}

export const getExp = () => state

export function resetExp() {
  state = initialExp
  subs.forEach(f => f())
}

export function useExp(): ExpState {
  return useSyncExternalStore(
    f => (subs.add(f), () => subs.delete(f)),
    getExp,
    getExp,
  )
}
