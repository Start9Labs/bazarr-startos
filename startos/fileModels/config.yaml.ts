import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const section = z.looseObject({}).catch({})

export const configYaml = FileHelper.yaml(
  { base: sdk.volumes.main, subpath: '/config/config.yaml' },
  z.looseObject({
    analytics: section,
    auth: section,
    general: section,
    sonarr: section,
    radarr: section,
  }),
)
