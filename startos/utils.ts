import {
  uiHostId as radarrHostId,
  uiPort as radarrPort,
} from 'radarr-startos/startos/utils'
import {
  uiHostId as sonarrHostId,
  uiPort as sonarrPort,
} from 'sonarr-startos/startos/utils'

export const uiPort = 6767
export const uiHostId = 'ui-multi'
export const adminUsername = 'admin'
// Shared media paths must match Sonarr, Radarr and Jellyfin.
export const filebrowserMountpoint = '/mnt/filebrowser'
export const nextexplorerMountpoint = '/mnt/nextexplorer'

export const arrApps = {
  sonarr: { hostId: sonarrHostId, port: sonarrPort },
  radarr: { hostId: radarrHostId, port: radarrPort },
} as const

export type ArrId = keyof typeof arrApps

export const publicMountpoint = (id: ArrId) => `/mnt/${id}`
