import api from './api'

export interface DashboardCounts {
  completedOrders: number
  pendingOrders: number
  draftOrders: number
  activeInvitations: number
}

// Backend response format (camelCase)
export interface DashboardCountsResponse {
  completedOrders: number
  pendingOrders: number
  draftOrders: number
  activeInvitations: number
}

export interface RapidInvitationRequest {
  candidateEmail: string
  packageId: number
}

export interface RapidInvitationResponse {
  success: boolean
  message: string
  invitationId?: number
  invitationToken?: string
  invitationLink?: string
}

export const dashboardService = {
  async getDashboardCounts(): Promise<DashboardCounts> {
    const response = await api.get<DashboardCounts>('/dashboard/counts')
    return response
  },

  async sendRapidInvitation(request: RapidInvitationRequest): Promise<RapidInvitationResponse> {
    const response = await api.post<RapidInvitationResponse>('/dashboard/rapid-invitation', request)
    return response
  }
}

