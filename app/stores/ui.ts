import { defineStore } from 'pinia'

export type ToastType = 'ok' | 'warn' | 'error'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const globalLoading = ref(false)

  function toast(message: string, type: ToastType = 'ok', durationMs = 3500) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), durationMs)
  }

  function dismiss(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, globalLoading, toast, dismiss }
})
