import type { Timestamp } from 'firebase/firestore'

export interface AppUser {
  uid: string
  displayName: string
  email: string
  initials: string
  role: 'director'
  createdAt: Timestamp
}
