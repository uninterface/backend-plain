import { type InjectionKey } from 'vue'
export const checkableLayoutKey: InjectionKey<{
  register(): () => void
}> = Symbol('plain-checkable-layout')
