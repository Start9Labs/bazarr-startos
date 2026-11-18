import { sdk } from '../sdk'
import { connectApps } from './connectApps'
import { mediaStorage } from './mediaStorage'
import { setAdminPassword } from './setAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(mediaStorage)
  .addAction(connectApps)
