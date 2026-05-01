import api from './axiosInstance';
import type { Meeting, CreateMeetingRequest } from '@/types';

export const meetingsApi = {
  getBuying: () =>
    api.get<Meeting[]>('/api/meetings/my/buying').then((r) => r.data),

  getSelling: () =>
    api.get<Meeting[]>('/api/meetings/my/selling').then((r) => r.data),

  create: (data: CreateMeetingRequest) =>
    api.post<Meeting>('/api/meetings', data).then((r) => r.data),

  updateStatus: (id: string | number, status: string) =>
    api.patch<Meeting>(`/api/meetings/${id}/status`, { status }).then((r) => r.data),
};
