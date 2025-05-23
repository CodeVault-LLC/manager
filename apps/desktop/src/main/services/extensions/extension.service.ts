import { IExtension } from '@shared/types/extension'

import { api } from '../api.service'

import { db } from '@main/database/data-source'

export const extensionService = {
  fetchAllExtensions: async () => {
    try {
      const response = await api.get<IExtension[]>('/extensions')
      return response.data
    } catch (error) {
      console.error('Error fetching extensions from marketplace:', error)
      throw error
    }
  },

  getInstalledExtensions: async () => {
    try {
      const installedExtensions = await db.query.extensions.findMany()

      return installedExtensions
    } catch (error) {
      console.error('Error fetching installed extensions:', error)
      throw error
    }
  }
}
