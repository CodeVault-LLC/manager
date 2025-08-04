import { IExtension } from '@manager/common'
import { api } from '../api.service'
import { DataService } from '@manager/data'

export const extensionService = {
  fetchAllExtensions: async () => {
    try {
      const response = await api.get<IExtension[]>('/extensions')
      return response.data
    } catch (error) {
      log.error('Error fetching extensions from marketplace:', error)
      throw error
    }
  },

  getInstalledExtensions: async () => {
    try {
      const db = DataService.getInstance().getDatabase()

      const installedExtensions = await db.query.extensions.findMany()

      return installedExtensions
    } catch (error) {
      log.error('Error fetching installed extensions:', error)
      throw error
    }
  }
}
