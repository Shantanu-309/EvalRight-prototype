import api from './api'

export interface SendInvitationRequest {
  candidateEmail: string
  packageId: number
  invitationType: 'manual' | 'orderWithInvitation' | 'rapid'
}

export interface SendInvitationResponse {
  success: boolean
  message: string
  invitationId?: number
  invitationToken?: string
  invitationLink?: string
}

export const invitationService = {
  async sendInvitation(request: SendInvitationRequest): Promise<SendInvitationResponse> {
    const response = await api.post<SendInvitationResponse>('/candidate/invitation/send', request)
    return response
  }
}












