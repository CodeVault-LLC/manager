import { WidgetSetting } from '@manager/common/src'
import { db } from '../../../database/data-source'
import {
  widgetInstance,
  WidgetInstanceType
} from '../../../database/models/schema'
import { generateUUID } from '../../../lib/uuid'
import { defaultWidgets } from './widgetDefinitions'

function hasDefault(
  setting: WidgetSetting
): setting is WidgetSetting & { default: any } {
  return 'default' in setting
}

export async function seedWidgetInstancesIfEmpty() {
  const existing = await db.select().from(widgetInstance).limit(1)
  if (existing.length > 0) {
    log.debug('Widget instances already exist, skipping seed')
    return
  }

  const instancesToInsert: WidgetInstanceType[] = defaultWidgets.map((def) => {
    const defaultSettings: Record<string, any> = {}

    for (const [key, setting] of Object.entries(def.settingsSchema)) {
      if (hasDefault(setting)) {
        defaultSettings[key] = setting.default
      }
    }

    return {
      id: generateUUID(),
      definitionId: def.id,
      layout: def.layout,
      static: false,
      settings: defaultSettings,
      active: true
    }
  })

  await db.insert(widgetInstance).values(instancesToInsert).run()
  log.info(`Seeded ${instancesToInsert.length} widget instances`)
}
