import axios, { AxiosInstance } from 'axios'
import { API_BASE_URL } from '@shared/constants'
import { ConfStorage } from '../store'

export let api: AxiosInstance

export const createAPI = async (): Promise<AxiosInstance> => {
  const token = await ConfStorage.getSecureData('userToken')

  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,

    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log('Unauthorized, redirecting to login...')

        /*window.location.replace(
          `${prefix}${updatedPath ? `?next_path=${updatedPath}` : ""}`
        );*/
      }
      return Promise.reject(error)
    }
  )

  api = instance
  return instance
}
