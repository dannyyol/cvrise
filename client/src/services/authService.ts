import { api } from '../lib/apiClient';

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  role: 'USER';
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
}

export interface GoogleLoginRequest {
  token: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<User> => {
    return api.post<RegisterRequest, User>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<AuthSession> => {
    return api.post<LoginRequest, AuthSession>('/auth/login', data);
  },

  googleLogin: async (token: string): Promise<AuthSession> => {
    return api.post<GoogleLoginRequest, AuthSession>('/auth/google', { token });
  },

  refreshToken: async (refreshToken?: string): Promise<AuthSession> => {
    if (refreshToken) {
      return api.post<{ refresh_token: string }, AuthSession>('/auth/refresh', { refresh_token: refreshToken });
    }
    return api.post<undefined, AuthSession>('/auth/refresh', undefined);
  },

  forgotPassword: async (email: string): Promise<{ detail: string }> => {
    return api.post<{ email: string }, { detail: string }>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ detail: string }> => {
    return api.post<{ token: string; new_password: string }, { detail: string }>('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  verifyEmail: async (token: string): Promise<{ detail: string }> => {
    return api.post<{ token: string }, { detail: string }>('/auth/verify-email', { token });
  },

  resendVerification: async (email: string): Promise<{ detail: string }> => {
    return api.post<{ email: string }, { detail: string }>('/auth/resend-verification', { email });
  },

  me: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  logout: async (): Promise<{ detail: string }> => {
    return api.post<undefined, { detail: string }>('/auth/logout', undefined);
  },
};
