import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  connectedApps: Value.multiselect({
    name: i18n('Apps'),
    description: i18n(
      'Apps on this server whose libraries Bazarr finds subtitles for. Deselecting an app turns it off in Bazarr.',
    ),
    values: {
      sonarr: 'Sonarr',
      radarr: 'Radarr',
    },
    default: [],
  }),
})

export const connectApps = sdk.Action.withInput(
  'connect-apps',

  async () => ({
    name: i18n('Connect Apps'),
    description: i18n(
      'Choose which apps on this server Bazarr syncs series and movies from. Bazarr reads each app’s address and API key automatically, and changing the selection restarts Bazarr.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    connectedApps:
      (await storeJson.read((s) => s.connectedApps).const(effects)) ?? [],
  }),

  async ({ effects, input }) =>
    storeJson.merge(effects, { connectedApps: input.connectedApps }),
)
