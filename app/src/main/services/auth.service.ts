import { ipcMain } from 'electron'
import { api } from './api.service'
import { ConfStorage } from '../store'

const loadAuthServices = () => {
  ipcMain.handle('auth:login', async (_, email: string, password: string) => {
    try {
      const response = await api.post<{ token: string }>('/users/login/', { email, password })
      const token = response.data.token
      if (token) ConfStorage.setSecureData('userToken', token)

      return response.data
    } catch (error: any) {
      throw error.response?.data
    }
  })

  ipcMain.handle('auth:register', async (_, data) => {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' || value instanceof Blob) {
          formData.append(key, value)
        } else {
          formData.append(key, JSON.stringify(value))
        }
      })
      const response = await api.post<{ token: string }>('/users/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const token = response.data.token
      if (token) ConfStorage.setSecureData('token', token)
      return response.data
    } catch (error: any) {
      throw error.response?.data
    }
  })
}

export { loadAuthServices }
