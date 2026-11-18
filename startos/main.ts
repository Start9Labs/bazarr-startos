import { createHash } from 'crypto'
import { FileHelper } from '@start9labs/start-sdk'
import { manifest as filebrowserManifest } from 'filebrowser-quantum-startos/startos/manifest'
import { manifest as nextexplorerManifest } from 'nextexplorer-startos/startos/manifest'
import { manifest as radarrManifest } from 'radarr-startos/startos/manifest'
import { manifest as sonarrManifest } from 'sonarr-startos/startos/manifest'
import { configYaml } from './fileModels/config.yaml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  adminUsername,
  ArrId,
  arrApps,
  filebrowserMountpoint,
  nextexplorerMountpoint,
  publicMountpoint,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Bazarr!'))

  const store = await storeJson
    .read((s) => ({
      adminPassword: s.adminPassword,
      mediaSources: s.mediaSources,
      connectedApps: s.connectedApps,
    }))
    .const(effects)
  if (!store) throw new Error('store.json is missing')

  // The address is null while the app is uninstalled, when its volume can't be mounted.
  const bridgeAddress = async (id: ArrId) =>
    store.connectedApps.includes(id)
      ? sdk.host
          .getBridgeAddress(effects, {
            packageId: id,
            hostId: arrApps[id].hostId,
            internalPort: arrApps[id].port,
            ssl: false,
          })
          .const()
      : null
  const addresses = {
    sonarr: await bridgeAddress('sonarr'),
    radarr: await bridgeAddress('radarr'),
  }

  let mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/config',
    readonly: false,
  })
  const installed = (id: 'filebrowser' | 'nextexplorer') =>
    sdk.getServiceManifest(effects, id, (m) => m !== null).const()
  if (
    store.mediaSources.includes('filebrowser') &&
    (await installed('filebrowser'))
  ) {
    mounts = mounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: filebrowserMountpoint,
      readonly: false,
    })
  }
  if (
    store.mediaSources.includes('nextexplorer') &&
    (await installed('nextexplorer'))
  ) {
    mounts = mounts.mountDependency<typeof nextexplorerManifest>({
      dependencyId: 'nextexplorer',
      volumeId: 'data',
      subpath: null,
      mountpoint: nextexplorerMountpoint,
      readonly: false,
    })
  }
  if (addresses.sonarr)
    mounts = mounts.mountDependency<typeof sonarrManifest>({
      dependencyId: 'sonarr',
      volumeId: 'public',
      subpath: null,
      mountpoint: publicMountpoint('sonarr'),
      readonly: true,
    })
  if (addresses.radarr)
    mounts = mounts.mountDependency<typeof radarrManifest>({
      dependencyId: 'radarr',
      volumeId: 'public',
      subpath: null,
      mountpoint: publicMountpoint('radarr'),
      readonly: true,
    })

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'bazarr' },
    mounts,
    'bazarr-sub',
  )

  const arrSettings = async (id: ArrId) => {
    const address = addresses[id]
    if (!address) return null
    const apiKey = (
      await FileHelper.string(
        await subcontainer.subpath(`${publicMountpoint(id)}/api-key`),
      )
        .read()
        .const(effects)
    )?.trim()
    if (!apiKey) return null
    const [ip, port] = address.split(/:(?=\d+$)/)
    return { ip, port: Number(port), base_url: '', ssl: false, apikey: apiKey }
  }
  const sonarr = await arrSettings('sonarr')
  const radarr = await arrSettings('radarr')

  // Bazarr stores the bare MD5 of the password; an empty value matches no login.
  await configYaml.merge(effects, {
    ...(sonarr && { sonarr }),
    ...(radarr && { radarr }),
    auth: {
      type: 'form',
      username: adminUsername,
      password: store.adminPassword
        ? createHash('md5').update(store.adminPassword).digest('hex')
        : '',
    },
    general: {
      ip: '*',
      port: uiPort,
      base_url: '',
      use_sonarr: !!sonarr,
      use_radarr: !!radarr,
    },
  })

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: {
      command: sdk.useEntrypoint(),
      runAsInit: true,
      env: { PUID: '1000', PGID: '1000', TZ: 'Etc/UTC' },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          `http://127.0.0.1:${uiPort}/api/system/ping`,
          {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          },
        ),
    },
    requires: [],
  })
})
