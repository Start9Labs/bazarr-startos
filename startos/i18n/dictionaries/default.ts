export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting Bazarr!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'Web UI': 4,
  'The Bazarr web interface and API': 5,
  'Set Admin Password': 6,
  'Reset Admin Password': 7,
  'Generate a new random password for the Bazarr admin account.': 8,
  'Replaces the current admin password. The old password stops working, and Bazarr restarts.': 9,
  'Login Credentials': 10,
  'Use these credentials to sign in to Bazarr.': 11,
  Username: 12,
  Password: 13,
  'Media Storage': 14,
  '- FileBrowser Quantum: mounted at /mnt/filebrowser\n- NextExplorer: mounted at /mnt/nextexplorer\nSelect the same storage Sonarr and Radarr use.': 15,
  'FileBrowser Quantum': 16,
  NextExplorer: 17,
  'Choose which file managers hold the TV and movie libraries Bazarr adds subtitles to. Each one is mounted read-write at the same path Sonarr and Radarr use, and changing the selection restarts Bazarr.': 18,
  Apps: 19,
  'Apps on this server whose libraries Bazarr finds subtitles for. Deselecting an app turns it off in Bazarr.': 20,
  'Connect Apps': 21,
  'Choose which apps on this server Bazarr syncs series and movies from. Bazarr reads each app’s address and API key automatically, and changing the selection restarts Bazarr.': 22,
  'Set the admin password before signing in': 23,
  'Choose the storage that holds your TV and movie libraries': 24,
  'Connect Bazarr to Sonarr or Radarr': 25,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
