import client from '@/services/http/client'

export const authApi = {
  login: async (username: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    const res = await client.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data
  },
  logout: async () => {
    await client.post('/auth/logout')
  },
  me: async () => {
    const res = await client.get('/auth/me')
    return res.data
  },
}
