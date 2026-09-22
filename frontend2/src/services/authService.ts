import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  accountId: number;
  email: string;
  name: string;
  roles: string[];
}

export interface ClientRegistrationRequest {
  companyName: string;
  legalName: string;
  companyEmail: string;
  companyPhoneNumber: string;
  country: string;
  industry: string;
  fullName: string;
  designation: string;
  workEmail: string;
  workPhoneNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  captchaToken: string;
}

export interface ClientRegistrationResponse {
  success: boolean;
  message: string;
  accountId?: number;
  clientId?: number;
}

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email: request.email,
      password: request.password,
    });
    
    // Store token
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      accountId: response.accountId,
      email: response.email,
      name: response.name,
      roles: response.roles,
    }));
    
    return response;
  },

  async registerClient(request: ClientRegistrationRequest): Promise<ClientRegistrationResponse> {
    return api.post<ClientRegistrationResponse>('/auth/register/client', request);
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): { accountId: number; email: string; name: string; roles: string[] } | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles.includes(role) ?? false;
  },
};






