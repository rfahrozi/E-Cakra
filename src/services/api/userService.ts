import axiosClient from '../../lib/axios'
import { User } from '../../types/auth'

export const userService = {
  getAll: async (): Promise<User[]> => {
    const res = await axiosClient.get<User[]>('/users')
    return res.data
  },

  getById: async (id: string): Promise<User> => {
    const res = await axiosClient.get<User>(`/users/${id}`)
    return res.data
  },
}
