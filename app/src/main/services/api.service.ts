import axios from 'axios'
import { API_BASE_URL } from '@shared/constants'
import { ConfStorage } from '../store'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${ConfStorage.getSecureData('userToken')}`
  }
})

api.interceptors.response.use(
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
