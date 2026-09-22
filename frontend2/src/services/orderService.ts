import api from './api'

export interface ManualOrderRequest {
  firstName: string
  lastName: string
  email: string
  packageId: number
}

export interface ManualOrderResponse {
  success: boolean
  message: string
  orderId?: number
  candidateId?: number
}

export interface InvitationOrderRequest {
  candidateEmail: string
  packageId: number
  expiresAt?: string
}

export interface InvitationOrderResponse {
  success: boolean
  message: string
  invitationId?: number
  invitationToken?: string
  invitationLink?: string
}

export interface Package {
  id: number
  name: string
  code?: string
  description?: string
}

export const orderService = {
  async createManualOrder(request: ManualOrderRequest): Promise<ManualOrderResponse> {
    const response = await api.post<ManualOrderResponse>('/orders/manual', request)
    return response
  },

  async createInvitationOrder(request: InvitationOrderRequest): Promise<InvitationOrderResponse> {
    const response = await api.post<InvitationOrderResponse>('/orders/invitation', request)
    return response
  },

  async getScreeningPackages(): Promise<Package[]> {
    const response = await api.get<Package[]>('/packages')
    return response
  }
}


