import { API_BASE_URL } from '@shared/constants'
import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import axios from 'axios'
import { app } from 'electron'

import { getSystemVersion } from '../utils/system.helper'

import logger from '@main/logger'

export const api = axios.create({
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
      logger.error('Network error', {
        error: error.message,
        config: error.config
      })

      return Promise.reject({
        error: {
          code: EErrorCodes.NETWORK_ERROR,
          message:
            'Network error: Unable to connect to the server. Please check your internet connection.'
        }
      })
    }

    const status = error.response.status

    logger.error(
      `API [${status}]: ${error.response.config.method?.toUpperCase()} ${
        error.response.config.url
      } - ${error.response.data?.message || error.message}`,
      {
        error: error.message,
        config: error.config,
        data: error.response.data
      }
    )

    switch (status) {
      case 400:
        return Promise.reject({
          error: {
            code: EErrorCodes.BAD_REQUEST,
            message: error.response.data?.message || 'error.bad_request'
          }
        })

      case 401:
        return Promise.reject({
          error: {
            code: EErrorCodes.UNAUTHORIZED,
            message: 'You are not authorized to access this resource'
          }
        })
      case 403:
        return Promise.reject({
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
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
