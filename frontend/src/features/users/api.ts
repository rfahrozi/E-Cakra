import client from '@/services/http/client'
import type { User } from '@/types/common'

export interface UserCreatePayload {
  nama: string
  username: string
  password?: string
  role: string
  is_active: boolean
}

export const usersApi = {
  list: async (): Promise<User[]> => {
    const res = await client.get('/users')
    return res.data
  },
  create: async (data: UserCreatePayload): Promise<User> => {
    const res = await client.post('/users', data)
    return res.data
  },
  update: async (id: string, data: Partial<UserCreatePayload>): Promise<User> => {
    const res = await client.patch(`/users/${id}`, data)
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/users/${id}`)
  }
}
