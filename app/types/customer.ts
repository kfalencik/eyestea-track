import type { Timestamp } from 'firebase/firestore'

export type CustomerType = 'licensed_retailer' | 'wholesaler' | 'other'

export interface DueDiligenceEntry {
  id: string
  checkedAt: Timestamp
  checkedBy: string
  method: 'online_hmrc' | 'document_review' | 'site_visit' | 'phone'
  awrsStatus?: 'approved' | 'not_approved' | 'not_applicable'
  licenceStatus?: 'valid' | 'expired' | 'not_applicable'
  idVerified?: boolean
  notes: string
  nextReviewDate?: string   // ISO date string YYYY-MM-DD
}

export interface Customer {
  id: string

  // Identity
  name: string              // trading / display name
  company: string           // legal company name
  type: CustomerType

  // Regulatory — AWRS / licensing
  companyRegNumber: string
  vatNumber: string
  awrsUrn: string           // required if type === 'wholesaler'
  premisesLicenceNumber: string     // required if type === 'licensed_retailer'
  personalLicenceHolder: string     // required if type === 'licensed_retailer'
  idVerifiedDate: string    // ISO date — when you last checked their ID docs
  idNextReviewDate: string  // ISO date — when next check is due

  // Contact
  contactName: string
  email: string
  phone: string

  // Delivery address
  address: {
    line1: string
    line2: string
    city: string
    county: string
    postcode: string
    country: string
  }

  // Commercial
  paymentTermsDays: number  // e.g. 30
  creditLimitGbp: number    // 0 = no limit / pro-forma

  notes: string

  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
}
