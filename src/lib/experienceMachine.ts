import { findFlavor, findFunction } from '../content/experience'

export type ExpState = { step: 'function' | 'flavor' | 'pouring' | 'done'; fn?: string; flavor?: string }

export type ExpAction =
  | { type: 'pickFunction'; id: string }
  | { type: 'pickFlavor'; id: string }
  | { type: 'pourDone' }
  | { type: 'reset' }
  | { type: 'back' }

export const initialExp: ExpState = { step: 'function' }

// Invalid actions return the same object so React skips the re-render.
export function expReducer(s: ExpState, a: ExpAction): ExpState {
  switch (a.type) {
    case 'pickFunction':
      return s.step === 'function' && findFunction(a.id) ? { step: 'flavor', fn: a.id } : s
    case 'pickFlavor':
      return s.step === 'flavor' && findFlavor(a.id) ? { ...s, step: 'pouring', flavor: a.id } : s
    case 'pourDone':
      return s.step === 'pouring' ? { ...s, step: 'done' } : s
    case 'back':
      return s.step === 'flavor' ? initialExp : s
    case 'reset':
      return s.step === 'pouring' ? s : initialExp
  }
}
