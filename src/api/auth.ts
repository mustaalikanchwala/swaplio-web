import api from './axiosInstance';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),
};
