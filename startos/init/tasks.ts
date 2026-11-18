import { connectApps } from '../actions/connectApps'
import { mediaStorage } from '../actions/mediaStorage'
import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const tasks = sdk.setupOnInit(async (effects) => {
  const store = await storeJson.read().const(effects)
  if (!store?.adminPassword) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'critical', {
      reason: i18n('Set the admin password before signing in'),
    })
  }
  if (!store?.mediaSources.length) {
    await sdk.action.createOwnTask(effects, mediaStorage, 'critical', {
      reason: i18n('Choose the storage that holds your TV and movie libraries'),
    })
  }
  if (!store?.connectedApps.length) {
    await sdk.action.createOwnTask(effects, connectApps, 'important', {
      reason: i18n('Connect Bazarr to Sonarr or Radarr'),
    })
  }
})
