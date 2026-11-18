import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  adminPassword: z.string().nullable().catch(null),
  mediaSources: z.array(z.enum(['filebrowser', 'nextexplorer'])).catch([]),
  connectedApps: z.array(z.enum(['sonarr', 'radarr'])).catch([]),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)

export type StoreType = z.infer<typeof shape>
