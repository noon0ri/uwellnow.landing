import { useSyncExternalStore } from 'react'
import { expReducer, initialExp, type ExpAction, type ExpState } from './experienceMachine'

// Module store: shared by the Experience section and the 3D scene (Cup, display tracker).
let state: ExpState = initialExp
let changedAt = 0
const subs = new Set<() => void>()

export function dispatch(a: ExpAction) {
  const next = expReducer(state, a)
  if (next === state) return
  state = next
  changedAt = Date.now()
  subs.forEach(f => f())
}

// Function and flavour buttons share grid cells, so a double-tap would pick both: ignore taps right after a step change.
export function dispatchTap(a: ExpAction) {
  if (Date.now() - changedAt >= 300) dispatch(a)
}

export const getExp = () => state

export function resetExp() {
  state = initialExp
  changedAt = 0
  subs.forEach(f => f())
}

export function useExp(): ExpState {
  return useSyncExternalStore(
    f => (subs.add(f), () => subs.delete(f)),
    getExp,
    getExp,
  )
}
