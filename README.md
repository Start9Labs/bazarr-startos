<p align="center">
  <img src="icon.png" alt="Bazarr Logo" width="21%">
</p>

# Bazarr on StartOS

> Everything not listed in this document should behave the same as upstream Bazarr.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Bazarr](https://github.com/morpheus65535/bazarr) is a companion to Sonarr and Radarr: it follows their libraries, downloads subtitles in the languages you choose from dozens of providers, and saves them next to each episode and movie. This package owns Bazarr's admin login, closes the open-by-default web UI, connects Bazarr to Sonarr and Radarr on the same server with the API keys they publish, and mounts FileBrowser Quantum or NextExplorer at the same paths Sonarr, Radarr and Jellyfin use.

- **Upstream repo:** <https://github.com/morpheus65535/bazarr>
- **Wrapper repo:** <https://github.com/Start9Labs/bazarr-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The LinuxServer image, run unmodified through its own s6-overlay entrypoint.

| Property      | Value                                       |
| ------------- | ------------------------------------------- |
| Image         | `lscr.io/linuxserver/bazarr`                |
| Architectures | x86_64, aarch64                             |
| Command       | The image's `/init`, as PID 1 (`runAsInit`) |
| Environment   | `PUID=1000`, `PGID=1000`, `TZ=Etc/UTC`      |

| Subcontainer | Purpose                                       |
| ------------ | --------------------------------------------- |
| `bazarr-sub` | The `primary` daemon — the one to `attach` to |

Bazarr runs as uid 1000 (`abc`), the uid FileBrowser Quantum, NextExplorer, Sonarr and Radarr use for media, so subtitles it writes are immediately manageable from each of them. The image starts Bazarr with `--no-update`; Bazarr is updated by updating the package.

## Volume and Data Layout

Two volumes of its own, plus a read-write mount of each file manager the user selects and a read-only mount of each connected and installed app's `public` volume.

| Volume                | Mount Point         | Purpose                                                                                              |
| --------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| `main`                | `/config`           | `config/config.yaml`, `db/bazarr.db`, `log/`, `cache/`, and Bazarr's own scheduled backups `backup/` |
| `startos`             | not mounted         | `store.json`                                                                                         |
| `filebrowser` `data`  | `/mnt/filebrowser`  | TV and movie libraries, when FileBrowser Quantum is selected                                         |
| `nextexplorer` `data` | `/mnt/nextexplorer` | TV and movie libraries, when NextExplorer is selected; one directory per NextExplorer location       |
| `sonarr` `public`     | `/mnt/sonarr`       | Read-only, while connected; Sonarr's API key, `api-key`                                              |
| `radarr` `public`     | `/mnt/radarr`       | Read-only, while connected; Radarr's API key, `api-key`                                              |

**The media mount points are a contract with Sonarr, Radarr and Jellyfin.** They mount the same volumes at the same paths, so a file path Sonarr or Radarr reports is the path Bazarr opens: no path mappings are needed. Changing either mount point breaks that.

## File Models

Two models.

| File                 | Format | Modelled                | Written by                                    |
| -------------------- | ------ | ----------------------- | --------------------------------------------- |
| `store.json`         | JSON   | Yes — `FileHelper.json` | Install init, the actions                     |
| `config/config.yaml` | YAML   | Yes — `FileHelper.yaml` | Install init, then `setupMain` on every start |

| `store.json` key | Set by             | Notes                                         |
| ---------------- | ------------------ | --------------------------------------------- |
| `adminPassword`  | Set Admin Password | Plaintext; hashed into `config.yaml` on start |
| `mediaSources`   | Media Storage      | `filebrowser`, `nextexplorer`, or both        |
| `connectedApps`  | Connect Apps       | `sonarr`, `radarr`, or both                   |

`config.yaml` is Bazarr's own file and Bazarr rewrites it whenever settings are saved. The package writes only these keys:

| Key                                                               | When                         | Value                                                         |
| ----------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `auth.type`                                                       | Every start                  | `form`                                                        |
| `auth.username`                                                   | Every start                  | `admin`                                                       |
| `auth.password`                                                   | Every start                  | MD5 hex of `store.json` `adminPassword`, or empty while unset |
| `general.ip`, `general.port`, `general.base_url`                  | Every start                  | `*`, `6767`, empty                                            |
| `general.use_sonarr`, `general.use_radarr`                        | Every start                  | Whether the app is connected, installed and has an API key    |
| `sonarr.*`, `radarr.*`: `ip`, `port`, `base_url`, `ssl`, `apikey` | Every start, while connected | The app's bridge address and published API key                |
| `analytics.enabled`                                               | Install only                 | `false`                                                       |

**Writing `auth` before Bazarr's first boot is what closes the web UI.** Out of the box Bazarr has no authentication, so whoever loads the UI first owns it. Bazarr compares a login against the bare MD5 of the submitted password; an empty `auth.password` matches nothing, so the UI stays locked until Set Admin Password runs.

Everything else in `config.yaml`, and every setting in the UI — languages, profiles, providers, scoring, schedules — is yours. Bazarr's own API key (`auth.apikey`) is generated by Bazarr and left alone.

## Dependencies

Four, all optional.

| Dependency     | Kind                              | Declared while            |
| -------------- | --------------------------------- | ------------------------- |
| `sonarr`       | `running`, health check `primary` | Selected in Connect Apps  |
| `radarr`       | `running`, health check `primary` | Selected in Connect Apps  |
| `filebrowser`  | `exists`                          | Selected in Media Storage |
| `nextexplorer` | `exists`                          | Selected in Media Storage |

Sonarr's and Radarr's bridge addresses are resolved with `getBridgeAddress` from each app's `ui-multi` host and internal port, imported from `sonarr-startos` and `radarr-startos`. Each API key is read from `/mnt/<app>/api-key` and watched, so a change to either address or key restarts Bazarr with the new values. While a connected app is uninstalled its address resolves to nothing: Bazarr mounts nothing of it, sets `use_<app>: false`, and starts normally; installing it again restarts Bazarr, which reconnects it.

Bazarr reads and writes a file manager's `data` volume whether or not that service is running, so it only has to be installed. While a selected file manager is uninstalled, Bazarr mounts nothing of it and starts anyway.

## Network Access and Interfaces

One HTTP interface, serving both the web UI and the API.

| Interface | Id   | Type | Port | Masked | Description                      |
| --------- | ---- | ---- | ---- | ------ | -------------------------------- |
| Web UI    | `ui` | ui   | 6767 | No     | The Bazarr web interface and API |

The API takes Bazarr's own API key in the `X-API-KEY` header, shown under **Settings → General**; the web UI uses a session cookie.

Bazarr connects out to the subtitle providers you enable, and Sonarr and Radarr over the StartOS bridge.

## Installation and First-Run Flow

Install seeds `store.json`, turns analytics off in `config.yaml`, and raises three tasks: Set Admin Password and Media Storage (critical), and Connect Apps (important). Bazarr does not start until the critical ones are done.

After that: add languages, a language profile and at least one subtitle provider in Bazarr's settings. `instructions.md` walks through it.

## Actions

Three actions, all available whether or not Bazarr is running. Each writes `store.json`, and the restart that triggers applies it.

### Set Admin Password / Reset Admin Password

- **When:** once at setup; again to rotate the password.
- **What it changes:** `adminPassword` in `store.json`; its MD5 goes into `config.yaml` on the restart.
- **Cost:** seconds, then a restart.
- **Repeat safety:** safe; each run replaces the password, the old one stops working, and StartOS asks for confirmation once a password exists.
- **Outputs:** username `admin` and the password, masked and copyable.

### Media Storage

- **When:** at setup, and whenever you add or drop a file manager. Choose the same ones Sonarr and Radarr use.
- **What it changes:** `mediaSources` in `store.json`, which decides the mounts and which dependencies are declared.
- **Cost:** a restart.
- **Repeat safety:** safe. Dropping a file manager unmounts it; subtitles already on it stay on disk.

### Connect Apps

- **When:** at setup, and whenever you add or drop Sonarr or Radarr. Nothing to redo when their address or API key changes.
- **What it changes:** `connectedApps` in `store.json`, which declares the dependencies, mounts each app's `public` volume, and turns `use_sonarr` / `use_radarr` on or off in Bazarr.
- **Cost:** a restart.
- **Repeat safety:** safe. Deselecting an app turns its sync off in Bazarr.

## Tasks

| Task               | Raised when                 | Severity  | Cleared by         |
| ------------------ | --------------------------- | --------- | ------------------ |
| Set Admin Password | No password in `store.json` | critical  | Running the action |
| Media Storage      | No file manager selected    | critical  | Running the action |
| Connect Apps       | No app selected             | important | Running the action |

## Health Checks

| Check         | Probes                              | Failure means                                 |
| ------------- | ----------------------------------- | --------------------------------------------- |
| Web Interface | `GET /api/system/ping` on port 6767 | Bazarr is starting, migrating, or has crashed |

`/api/system/ping` answers without authentication. Problems Bazarr finds itself, such as a missing language profile, are on Bazarr's **System → Status** page.

## Backups and Restore

The `startos` and `main` volumes, excluding `log/`, `cache/`, `restore/` and `backup/` (Bazarr's own scheduled database copies, which the StartOS backup already covers). Bazarr is stopped during the backup, so `bazarr.db` is copied quiescent.

The subtitle files themselves live next to the media in FileBrowser Quantum or NextExplorer and are backed up with that service, not this one. A restore brings back Bazarr's database, settings, history, the admin password and the app selections; the next start reconnects Sonarr and Radarr with their live addresses and keys.

## Limitations and Differences

1. **Authentication cannot be turned off.** The package applies form login with user `admin` on every start; a different username, password or method set in Bazarr's settings lasts only until the next restart.
2. **The Sonarr and Radarr connections are managed.** Their address, port, base URL, SSL flag and API key, and whether each is enabled, are reset on every start. Their other settings, such as sync intervals and excluded tags, are yours.
3. **No local media storage.** Bazarr only sees media in FileBrowser Quantum or NextExplorer, where Sonarr and Radarr keep it.
4. **Plex and Jellyfin integrations are not configured.** Jellyfin finds new subtitles on its scheduled library scan; either integration can be set up by hand in Bazarr's settings.

---

## Quick Reference for AI Consumers

```yaml
package_id: 'bazarr'
image: 'lscr.io/linuxserver/bazarr'
architectures: [x86_64, aarch64]
subcontainers: [bazarr-sub]
volumes:
  main: '/config'
  startos: 'store.json (not mounted)'
dependency_mounts:
  filebrowser: '/mnt/filebrowser (read-write)'
  nextexplorer: '/mnt/nextexplorer (read-write)'
  sonarr: '/mnt/sonarr (public, read-only)'
  radarr: '/mnt/radarr (public, read-only)'
file_models: [store.json, config/config.yaml]
startos_managed_env_vars: [PUID, PGID, TZ]
dependencies:
  - { id: sonarr, kind: running, optional: true }
  - { id: radarr, kind: running, optional: true }
  - { id: filebrowser, kind: exists, optional: true }
  - { id: nextexplorer, kind: exists, optional: true }
interfaces:
  ui: { host_id: ui-multi, port: 6767, type: ui, protocol: http }
actions: [set-admin-password, media-storage, connect-apps]
tasks:
  - { action: set-admin-password, severity: critical }
  - { action: media-storage, severity: critical }
  - { action: connect-apps, severity: important }
health_checks: [primary]
```
