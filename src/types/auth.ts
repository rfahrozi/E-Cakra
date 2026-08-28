export interface User {
  id: string
  nama: string
  username: string
  role: 'admin' | 'operator' | 'panitera'
  is_active: boolean
}

export interface LoginResponse {
  user: User
  access_token: string
  token_type: string
}
