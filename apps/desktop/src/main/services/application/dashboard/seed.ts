import { db } from '../../../database/data-source'
import { widgetDefinitions, widgets } from '../../../database/models/schema'
import { defaultWidgetDefinitions } from './widgetDefinitions'

export async function seedWidgetsAndDefinitionsIfEmpty() {
  const existing = await db.select().from(widgetDefinitions).limit(1)
  if (existing.length > 0) {
    log.debug('Widget definitions already exist, skipping seed')
    return
  }

  const defsToInsert = defaultWidgetDefinitions.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    type: def.type,
    settingsSchema: def.settingsSchema,
    requirements: def.requirements ?? [],
    locales: def.locales ?? []
  }))

  await db.insert(widgetDefinitions).values(defsToInsert).run()
  log.info(`Seeded ${defsToInsert.length} widget definitions`)

  const widgetsToInsert = defaultWidgetDefinitions.map((def) => ({
    id: `${def.id}`,
    definitionId: def.id,
    layout: def.layout,
    static: false,
    settings: {},
    active: true
  }))

  await db.insert(widgets).values(widgetsToInsert).run()
  log.info(`Seeded ${widgetsToInsert.length} default widgets`)
}
