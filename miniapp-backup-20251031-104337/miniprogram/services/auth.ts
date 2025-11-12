import { get, post } from './request'

export async function login(phone: string, password: string): Promise<any> {
  return post('/auth/login', {
    username: phone,
    password,
    type: 'phone'
  })
}

export async function register(data: any): Promise<any> {
  return post('/auth/register', data)
}

export async function wxLogin(code: string): Promise<any> {
  return post('/auth/wx-login', { code })
}

export async function getCurrentUser(): Promise<any> {
  return get('/auth/me')
}

export function saveLoginInfo(token: string, user: any): void {
  wx.setStorageSync('token', token)
  wx.setStorageSync('user', JSON.stringify(user))
}

export function clearLoginInfo(): void {
  wx.removeStorageSync('token')
  wx.removeStorageSync('user')
}

export function getLocalUser(): any {
  const userStr = wx.getStorageSync('user')
  return userStr ? JSON.parse(userStr) : null
}

export function isLoggedIn(): boolean {
  return !!wx.getStorageSync('token')
}
