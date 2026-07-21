#!/usr/bin/env bash
# Build, package, install and launch the Night Gallery Tizen app on a real TV.
# Adapted from the sibling Babak TV project's installer (same TV, same two
# traps) — read TRAP #1 and TRAP #2 in build_and_package before "fixing"
# anything that looks odd.
set -euo pipefail

# Defaults (all overridable via flag or env var)
TIZEN_STUDIO="${TIZEN_STUDIO:-$HOME/tizen-studio}"
TV_IP="${TV_IP:-}"
SDB_PORT="${SDB_PORT:-26101}"
# BabakTV is a reused signing profile (a Tizen certificate profile, not a
# BabakTV-specific artifact) — the same author cert works for any of this
# author's apps on this TV, so Night Gallery signs with it too.
PROFILE="${PROFILE:-BabakTV}"
APP_ID="${APP_ID:-NightGalry.NightGallery}"
TARGET_OVERRIDE=""
LAUNCH=1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIZEN_DIR="$REPO_ROOT/tizen"
log()  { printf '==> %s\n' "$*" >&2; }   # stderr: discover_ip's stdout is captured as its return value
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Build, package, install and launch the Night Gallery Tizen app on a real TV.

Options:
  --ip <addr>       TV IP address. Default: \$TV_IP, else auto-discover
                     (existing sdb connection, else scan the local /24 for
                     an open sdb port).
  --port <n>        sdb debug port. Default: 26101.
  --profile <name>  Certificate/signing profile name. Default: BabakTV
                     (reused signing profile — see comment near PROFILE
                     above).
  --target <name>   Force the sdb target/device name instead of reading it
                     from 'sdb devices' after connecting.
  --app-id <id>     Tizen application id to launch. Default:
                     NightGalry.NightGallery.
  --no-launch       Install but do not launch the app afterward.
  -h, --help        Show this help and exit.

Env vars: TIZEN_STUDIO (SDK root, default \$HOME/tizen-studio), TV_IP.

Defaults: profile BabakTV, app id NightGalry.NightGallery. The TV is
auto-discovered on the local network when --ip is not given.
EOF
}
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ip) TV_IP="${2:?--ip needs a value}"; shift 2 ;;
    --port) SDB_PORT="${2:?--port needs a value}"; shift 2 ;;
    --profile) PROFILE="${2:?--profile needs a value}"; shift 2 ;;
    --target) TARGET_OVERRIDE="${2:?--target needs a value}"; shift 2 ;;
    --app-id) APP_ID="${2:?--app-id needs a value}"; shift 2 ;;
    --no-launch) LAUNCH=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "unknown argument: $1 (see --help)" ;;
  esac
done

[[ "$(id -u)" -ne 0 ]] || die "refusing to run as root — Tizen Studio's certs/profiles live under a normal user's \$HOME"
# Neither CLI is on PATH by default; prepend both, then fail loudly here
# rather than deep inside a build phase if either is missing.
export PATH="$TIZEN_STUDIO/tools/ide/bin:$TIZEN_STUDIO/tools:$PATH"
command -v tizen >/dev/null 2>&1 || die "tizen CLI not found at $TIZEN_STUDIO/tools/ide/bin/tizen (set TIZEN_STUDIO if installed elsewhere)"
command -v sdb   >/dev/null 2>&1 || die "sdb CLI not found at $TIZEN_STUDIO/tools/sdb (set TIZEN_STUDIO if installed elsewhere)"
TIZEN_BIN="$(command -v tizen)"
SDB_BIN="$(command -v sdb)"
# This host's LAN address (`|| true` — grep exits non-zero when nothing matches).
detect_lan_ip() { hostname -I 2>/dev/null | tr ' ' '\n' | grep -E '^(192\.168\.|10\.)' | head -1 || true; }
scan_one() { # host port -> prints host if port is open
  local host="$1" port="$2"
  timeout 1 bash -c "echo >/dev/tcp/${host}/${port}" 2>/dev/null && echo "$host"
}
export -f scan_one
discover_ip() {
  local existing
  existing="$("$SDB_BIN" devices 2>/dev/null | awk 'NR>1 && $2=="device"{print $1; exit}' || true)"
  if [[ -n "$existing" ]]; then
    log "Using already-connected device: $existing"
    echo "${existing%%:*}"
    return 0
  fi
  local lan_ip prefix found
  lan_ip="$(detect_lan_ip)"
  [[ -n "$lan_ip" ]] || die "could not determine this machine's LAN IP to scan; pass --ip"
  prefix="${lan_ip%.*}"
  log "No connected device; scanning $prefix.0/24 for an open port $SDB_PORT (bounded, ~1s/host, parallel)..."
  # `|| true` is required: xargs exits non-zero whenever any of the 254 probes
  # fails (i.e. almost always — most hosts are closed), and pipefail propagates
  # that even though `head -1` succeeded. Without it, set -e kills every scan,
  # including the ones that DID find the TV.
  found="$(seq 1 254 | xargs -P 40 -I{} bash -c 'scan_one "$0.{}" "$1"' "$prefix" "$SDB_PORT" 2>/dev/null | head -1 || true)"
  if [[ -z "$found" ]]; then
    die "no TV found on $prefix.0/24 with port $SDB_PORT open. Enable Developer Mode on the TV (Smart Hub -> Apps -> 1,2,3,4,5) and pass --ip."
  fi
  log "Found candidate TV at $found"
  echo "$found"
}
connect_and_confirm() {
  log "Connecting to $TV_IP:$SDB_PORT ..."
  "$SDB_BIN" connect "$TV_IP:$SDB_PORT" >/dev/null || true
  local line state
  line="$("$SDB_BIN" devices 2>/dev/null | awk -v ip="$TV_IP:" 'index($1, ip)==1{print; exit}' || true)"
  [[ -n "$line" ]] || die "sdb connect ran but $TV_IP:$SDB_PORT is not listed by 'sdb devices' — check Developer Mode is on and this host's IP is registered on the TV"
  state="$(awk '{print $2}' <<<"$line")"
  [[ "$state" == "device" ]] || die "device state is '$state' (expected 'device') for $TV_IP:$SDB_PORT"
  if [[ -n "$TARGET_OVERRIDE" ]]; then
    TARGET_NAME="$TARGET_OVERRIDE"
  else
    TARGET_NAME="$(awk '{print $3}' <<<"$line")"
  fi
  [[ -n "${TARGET_NAME:-}" ]] || die "could not read a target/device name from 'sdb devices' output"
  log "Confirmed target: $TARGET_NAME"
}
# No preflight_warnings step here (unlike Babak TV): Night Gallery is a
# serverless, fully self-contained .wgt by hard constraint — there is no
# companion server or config.js pointing at one to sanity-check.
build_and_package() {
  log "Build (tizen build-web)..."
  # TRAP #1: build-web prints a fatal-looking Java stack trace
  # (ClassNotFoundException: org.eclipse.core.runtime.Plugin) yet still fills
  # .buildResult correctly. Cosmetic — never turn this into `|| exit 1`. Clean
  # first, or a stale .buildResult gets packaged into the new archive.
  rm -rf "$TIZEN_DIR/.buildResult"
  ( cd "$TIZEN_DIR" && "$TIZEN_BIN" build-web -- . ) || log "  (build-web exited non-zero — expected, ignoring; see comment above)"
  [[ -f "$TIZEN_DIR/.buildResult/index.html" ]] || die "no .buildResult/index.html — a real build failure, not the cosmetic Java trace."
  log "Package (tizen package)..."
  local marker; marker="$(mktemp)"
  # .buildResult, NOT '.' — packaging the source dir sweeps .buildResult (and
  # any previous .wgt) in. This invocation is the TV-verified one.
  ( cd "$TIZEN_DIR" && "$TIZEN_BIN" package -t wgt -s "$PROFILE" -- .buildResult )
  WGT_SRC="$(find "$TIZEN_DIR/.buildResult" -maxdepth 1 -name '*.wgt' -newer "$marker" 2>/dev/null | head -1)"
  rm -f "$marker"
  [[ -n "$WGT_SRC" ]] || die "tizen package produced no .wgt file"
  # TRAP #2 — THE CRITICAL ONE: tizen package names the archive after the
  # widget's <name> in config.xml ("Night Gallery"), producing
  # "Night Gallery.wgt". Installing a .wgt whose filename contains a SPACE
  # fails with a SILENT, reasonless error — "Failed to install Tizen
  # application." and nothing else. No dlog output, and sdb shell doesn't
  # work on retail TVs, so there is no device-side way to diagnose it. Copy
  # to a space-free name first; that installs first try. Do this always,
  # even if today's name looks fine.
  WGT="$(dirname "$WGT_SRC")/NightGallery.wgt"
  cp -f "$WGT_SRC" "$WGT"
  log "  packaged: $(basename "$WGT_SRC") -> $(basename "$WGT")"
}
verify_package() {
  log "Verify package contents (this replaces trusting build-web's exit code)..."
  local listing
  listing="$(unzip -l "$WGT")"
  for f in index.html config.xml js/app.js js/rotation.js js/content.js css/base.css fonts/chess-glyphs.woff2 icon.png; do
    grep -q "$f" <<<"$listing" || die "verification failed: '$f' missing from $(basename "$WGT")"
  done
  BUILD_STAMP="$(unzip -p "$WGT" index.html 2>/dev/null | grep -oE 'b[0-9][0-9]' | head -1 || true)"
  BUILD_STAMP="${BUILD_STAMP:-unknown}"
  log "  contents OK — build stamp in index.html: $BUILD_STAMP"
}
install_and_launch() {
  # NOTE: sdb shell does not work on retail TVs (returns empty/"closed") —
  # never depend on it here or anywhere else in this script.
  log "Install..."
  # cd in and pass a BARE filename with the dir as '--': the repo path itself
  # may contain a space, and an absolute -n re-triggers TRAP #2.
  ( cd "$(dirname "$WGT")" && "$TIZEN_BIN" install -n "$(basename "$WGT")" -t "$TARGET_NAME" -- . )
  if [[ "$LAUNCH" -eq 1 ]]; then
    log "Launch..."
    "$TIZEN_BIN" run -p "$APP_ID" -t "$TARGET_NAME"
  else
    log "Skipping launch (--no-launch)"
  fi
}
main() {
  [[ -n "$TV_IP" ]] || TV_IP="$(discover_ip)"
  connect_and_confirm
  build_and_package
  verify_package
  install_and_launch
  cat <<EOF
==================== Night Gallery install summary ====================
  Target   : $TARGET_NAME ($TV_IP:$SDB_PORT)
  App id   : $APP_ID
  Build    : $BUILD_STAMP
  Package  : $WGT
  Re-run   : $(basename "$0") --ip $TV_IP $([[ "$LAUNCH" -eq 1 ]] || echo --no-launch)
==========================================================================
EOF
}
main
