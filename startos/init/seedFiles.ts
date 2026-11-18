import { configYaml } from '../fileModels/config.yaml'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await storeJson.merge(effects, {})
  await configYaml.merge(effects, { analytics: { enabled: false } })
})
