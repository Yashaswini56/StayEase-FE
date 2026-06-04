import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

type LoginReq = { email: string; password: string }
type RegisterReq = { name: string; email: string; password: string }

export async function login(req: LoginReq) {
  return api.post('/api/auth/login', req)
}

export async function register(req: RegisterReq) {
  return api.post('/api/auth/register', req)
}

export async function logout(token?: string) {
  return api.post(
    '/api/auth/logout',
    {},
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  )
}

export async function getCities(token?: string) {
  return api.get<string[]>('/api/cities', {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })
}

export default api
