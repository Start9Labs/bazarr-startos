# Updating Bazarr

## Determining the upstream version

Upstream is the LinuxServer image `lscr.io/linuxserver/bazarr`, pinned in `startos/manifest/index.ts`:

```typescript
source: { dockerTag: 'lscr.io/linuxserver/bazarr:v1.6.2-ls372' },
```

LinuxServer tags stable builds `v<bazarr version>-ls<build>`; `development-*` tags track Bazarr betas and are not stable. List stable releases in publication order:

```bash
gh api 'repos/linuxserver/docker-bazarr/releases?per_page=100' --jq '.[] | select(.draft == false and .prerelease == false) | select(.tag_name | test("^v[0-9]+\\.[0-9]+\\.[0-9]+-ls[0-9]+$")) | [.published_at, .tag_name] | @tsv'
```

Confirm the tag ships both architectures before pinning it:

```bash
docker manifest inspect lscr.io/linuxserver/bazarr:<tag> | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Read Bazarr's release notes (`gh release view -R morpheus65535/bazarr v<version>`) between the old and new versions. Check that `config/config.yaml` still has the `auth`, `general`, `sonarr` and `radarr` keys `startos/main.ts` writes, and that `auth.password` is still the bare MD5 of the password (`check_credentials` in `bazarr/utilities/helper.py`).
2. Edit `dockerTag` in `startos/manifest/index.ts`.
3. Edit `startos/versions/current.ts`: the version is the Bazarr version without the `v` and `-ls` parts (`'1.6.2:0'`). A new LinuxServer build of the same Bazarr version is a downstream revision bump (`:1`).
4. Keep the shared media mount points unchanged.
