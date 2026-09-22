import api from './api'

export interface ApplicantListItem {
  candidateId: number
  fullName: string
  email: string
  phone?: string
  invitationStatus: string
  verificationStatus: string
  packageName?: string
  createdAt: string
  submittedAt?: string
  orderId?: number
}

export interface ApplicantDetail {
  candidateId: number
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  countryOfResidence?: string
  status: string
  invitationStatus: string
  invitationSentAt?: string
  invitationAcceptedAt?: string
  invitationExpiresAt?: string
  orderId?: number
  orderReference?: string
  packageName?: string
  personalInfo?: PersonalInfo
  addresses: Address[]
  educations: Education[]
  employments: Employment[]
  socialMedia?: SocialMedia
  documents: Document[]
  consentSigned: boolean
  consentSignedAt?: string
  finalSubmittedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface PersonalInfo {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  countryOfResidence?: string
}

export interface Address {
  type: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  fromDate?: string
  toDate?: string
  isCurrent: boolean
}

export interface Education {
  institutionName: string
  degree?: string
  major?: string
  fromDate?: string
  toDate?: string
  country?: string
  certificateNumber?: string
}

export interface Employment {
  employerName: string
  designation?: string
  fromDate?: string
  toDate?: string
  location?: string
  contactInfo?: string
  isCurrent: boolean
}

export interface SocialMedia {
  consentGiven: boolean
  profiles: SocialMediaProfile[]
}

export interface SocialMediaProfile {
  platform: string
  url: string
}

export interface Document {
  documentType: string
  fileName: string
  contentType: string
  fileSize?: number
  uploadedAt?: string
  fileUrl?: string
}

export const applicantService = {
  async getApplicantsList(): Promise<ApplicantListItem[]> {
    const response = await api.get<ApplicantListItem[]>('/applicants')
    return response
  },

  async getApplicantDetail(candidateId: number): Promise<ApplicantDetail> {
    const response = await api.get<ApplicantDetail>(`/applicants/${candidateId}`)
    return response
  }
}




