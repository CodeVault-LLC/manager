import { app } from 'electron'
import axios from 'axios'
import { API_BASE_URL } from '@shared/constants'
import { getSystemVersion } from '../utils/system.helper'
import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'

export let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'App-Version': app.getVersion(),
    'App-Name': app.getName(),
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': app.getName(),
    'X-Platform': process.platform,
    'X-Arch': process.arch,
    'X-Node-Version': process.versions.node,
    'X-Electron-Version': process.versions.electron,
    'X-System': getSystemVersion()
  }
})

api.interceptors.response.use(
  (response) => response,
  (error): Promise<TCommunicationResponse<null>> => {
    if (!error.response) {
      return Promise.reject({
        error: {
          code: EErrorCodes.NETWORK_ERROR,
          message:
            'Network error: Unable to connect to the server. Please check your internet connection.'
        }
      })
    }

    const status = error.response.status

    console.error(
      `ERROR API [${status}]: ${error.response?.data?.error || error.message}`
    )

    switch (status) {
      case 401:
        return Promise.reject({
          error: {
            code: EErrorCodes.UNAUTHORIZED,
            message: 'You are not authorized to access this resource'
          }
        })
      case 403:
        console.log('Yup, error happened')
        return Promise.reject({
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'You do not have permission to access this resource'
          }
        })
      case 404:
        return Promise.reject({
          error: {
            code: '4040',
            message: 'Unable to find the requested resource'
          }
        })
      case 500:
        return Promise.reject({
          error: {
            code: '5000',
            message: 'Unable to process your request. Please try again later.'
          }
        })
      default:
        return Promise.reject({
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'Unable to process your request. Please try again later.'
          }
        })
    }
  }
)
