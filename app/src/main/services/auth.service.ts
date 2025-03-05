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
      console.log(error)

      if (error.response?.status === 403) return { error: 'Forbidden' }
      if (error.response?.status === 404) return { error: 'User was not found' }
    }
  })

  ipcMain.handle('auth:register', async (_, data) => {
    try {
      const { avatar, ...rest } = data

      const formData = new FormData()

      if (avatar) {
        formData.append('avatar', avatar, 'avatar.png') // Assuming the file is a PNG
      }

      Object.entries(rest).forEach(([key, value]) => {
        if (typeof value === 'string' || value instanceof Blob) {
          formData.append(key, value)
        } else {
          formData.append(key, JSON.stringify(value))
        }
      })

      const response = await api.post<{ token: string }>('/users/register/', formData)

      const token = response.data.token
      if (token) ConfStorage.setSecureData('userToken', token)

      return response.data
    } catch (error: any) {
      return { error: 'Registration failed' + error }
    }
  })
}

export { loadAuthServices }
