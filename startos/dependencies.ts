import { T } from '@start9labs/start-sdk'
import { storeJson, StoreType } from './fileModels/store.json'
import {
  filebrowserDescription,
  nextexplorerDescription,
  radarrDescription,
  sonarrDescription,
} from './manifest/i18n'
import { sdk } from './sdk'

type Enabled = (options: { effects: T.Effects }) => Promise<boolean>

const connected =
  (id: StoreType['connectedApps'][number]): Enabled =>
  async ({ effects }) =>
    (await storeJson.read((s) => s.connectedApps).const(effects))?.includes(
      id,
    ) ?? false

const selected =
  (id: StoreType['mediaSources'][number]): Enabled =>
  async ({ effects }) =>
    (await storeJson.read((s) => s.mediaSources).const(effects))?.includes(
      id,
    ) ?? false

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.optional('sonarr', {
      description: sonarrDescription,
      metadata: {
        title: 'Sonarr',
        icon: 'https://raw.githubusercontent.com/Sonarr/Sonarr/58fe69664800283237cbca06ace87766dfc66615/Logo/Sonarr.svg',
      },
      versionRange: '>=4.0.20.3014:7',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: connected('sonarr'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('radarr', {
      description: radarrDescription,
      metadata: {
        title: 'Radarr',
        icon: 'https://raw.githubusercontent.com/Radarr/Radarr/c0a0be6dde11ec4c9576366a7623322ea2a08775/Logo/Radarr.svg',
      },
      versionRange: '>=6.4.4.10685:6',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: connected('radarr'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('filebrowser', {
      description: filebrowserDescription,
      metadata: {
        title: 'FileBrowser Quantum',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-quantum-startos/e936a6c85a97b930b43cad5e9c0dd4898a2df567/icon.svg',
      },
      versionRange: '>=#quantum:2.0.2-stable:3',
      kind: 'exists',
      enabled: selected('filebrowser'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('nextexplorer', {
      description: nextexplorerDescription,
      metadata: {
        title: 'NextExplorer',
        icon: 'https://raw.githubusercontent.com/Start9Labs/nextexplorer-startos/04f7ecbfc31ad2205e0222dd7568fb881aa06c79/icon.svg',
      },
      versionRange: '>=2.2.7:0',
      kind: 'exists',
      enabled: selected('nextexplorer'),
    }),
  )
