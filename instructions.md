# Bazarr

## Documentation

- [Bazarr Setup Guide](https://wiki.bazarr.media/Getting-Started/Setup-Guide/) ([source](https://github.com/bazarr/wiki/blob/main/docs/Getting-Started/Setup-Guide.md)) — the upstream walkthrough of first setup
- [First-time Configuration](https://wiki.bazarr.media/Getting-Started/First-time-installation-configuration/) ([source](https://github.com/bazarr/wiki/blob/main/docs/Getting-Started/First-time-installation-configuration.md)) — languages, profiles and providers
- [Bazarr Settings](https://github.com/bazarr/wiki/tree/main/docs/Additional-Configuration/Settings) — every settings page explained
- [Bazarr FAQ](https://wiki.bazarr.media/Troubleshooting/FAQ/) ([source](https://github.com/bazarr/wiki/blob/main/docs/Troubleshooting/FAQ.md)) — common questions about searching, scoring and syncing subtitles

## What you get on StartOS

- The Bazarr web interface, behind a login that is set up for you.
- Sonarr and Radarr on this server connected for you, with their addresses and API keys kept up to date.
- Subtitles saved next to your episodes and movies in FileBrowser Quantum or NextExplorer, where Jellyfin picks them up.
- Bazarr's settings, history and database in StartOS backups. The subtitle files are backed up with FileBrowser Quantum or NextExplorer.

## Getting set up

1. Set up Sonarr, Radarr, or both, with their libraries in FileBrowser Quantum or NextExplorer.
2. Run **Set Admin Password** and save the username and password it shows.
3. Run **Media Storage** and choose the same file managers Sonarr and Radarr use. Bazarr sees each one at the same path they do, so no path mappings are needed.
4. Run **Connect Apps** and choose Sonarr, Radarr, or both.
5. Start Bazarr, open the Web UI, and sign in.
6. In Bazarr, go to **Settings → Languages**, add the languages you want, create a language profile, and set it as the default for series and movies.
7. Go to **Settings → Providers** and add at least one subtitle provider. Many, such as OpenSubtitles.com, need a free account of your own.
8. Your series and movies appear under **Series** and **Movies** after the first sync. Assign your language profile to existing items with **Mass Edit**.

## Using Bazarr

- **Reset Admin Password** generates a new password and restarts Bazarr. The old password stops working.
- **Media Storage** changes which file managers Bazarr can write subtitles to, and restarts Bazarr.
- **Connect Apps** changes which of Sonarr and Radarr Bazarr syncs from, and restarts Bazarr. The connections follow those apps automatically; there is nothing to redo when their address or API key changes.
- Bazarr's login and its Sonarr and Radarr connections are managed by StartOS: changing them in Bazarr's settings is undone on the next restart.
