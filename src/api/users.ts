import api from './axiosInstance';
import type { User } from '@/types';

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  institution?: string;
}

export const usersApi = {
  getMe: () =>
    api.get<User>('/api/users/me').then((r) => r.data),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<User>('/api/users/me', data).then((r) => r.data),
};