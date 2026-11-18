# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- `auth.password` in `config.yaml` is the bare MD5 hex of the password, the format Bazarr's `check_credentials` compares against. An empty value matches no password, which keeps the UI closed until Set Admin Password runs.
