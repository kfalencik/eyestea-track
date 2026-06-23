import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type AuthError,
  type User,
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const auth = useFirebaseAuth()!
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onAuthStateChanged(auth, (u) => {
    user.value = u
    loading.value = false
  })

  function setUser(u: User | null) {
    user.value = u
    loading.value = false
  }

  async function login(email: string, password: string) {
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      const code = (e as AuthError)?.code ?? ''
      error.value = friendlyAuthError(code)
      throw e
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    navigateTo('/login')
  }

  function friendlyAuthError(code: string): string {
    if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-email'].includes(code)) {
      return 'Email or password is incorrect.'
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a few minutes and try again.'
    }
    if (code === 'auth/user-disabled') {
      return 'This account has been disabled. Contact support.'
    }
    return 'Something went wrong. Please try again.'
  }

  const isLoggedIn = computed(() => !!user.value)
  const initials = computed(() => {
    if (!user.value?.displayName) return '??'
    return user.value.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  return { user, loading, error, isLoggedIn, initials, setUser, login, logout }
})
