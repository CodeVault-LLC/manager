import { app } from 'electron'
import axios from 'axios'
import { API_BASE_URL } from '@shared/constants'
import { getSystemVersion } from '../utils/system.helper'

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
    'X-OS-Release': process.getSystemVersion(),
    'X-System': getSystemVersion()
  }
})
