import axiosClient from '../../lib/axios'
import { LoginResponse } from '../../types/auth'

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await axiosClient.post<LoginResponse>('/auth/login', { username, password })
    return res.data
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout')
  },

  me: async () => {
    const res = await axiosClient.get('/auth/me')
    return res.data
  },
}
