#!/usr/bin/env bash
#
# Vendor the SheetJS (xlsx) tarball into this repository.
#
# SheetJS publishes its fixed/secure releases only on its own CDN, not on npm
# (npm is frozen at the vulnerable 0.18.5). We therefore commit the tarball to
# the repo and install it through a `file:` dependency in
# packages/server/package.json. The Docker build installs from that committed
# file, so a deploy never depends on the CDN being reachable.
#
# This script is the "get it from the CDN" half: it downloads a given version
# from the SheetJS CDN into vendor/xlsx/. If the CDN is unreachable (or serves
# something invalid) it keeps the tarball already committed — i.e. CDN when
# available, our own file otherwise.
#
# Usage:
#   ./scripts/vendor-xlsx.sh            # ensure the pinned version is present
#   ./scripts/vendor-xlsx.sh 0.20.3     # fetch/refresh a specific version
#
# To move to a newer version: run this with the new version, then update the
# xlsx "file:" path in packages/server/package.json to the new filename, run
# `pnpm install`, test imports/exports, and commit vendor/ + package.json +
# pnpm-lock.yaml together.
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")/.."

VERSION="${1:-0.20.3}"
DEST_DIR="vendor/xlsx"
DEST="$DEST_DIR/xlsx-${VERSION}.tgz"
URL="https://cdn.sheetjs.com/xlsx-${VERSION}/xlsx-${VERSION}.tgz"

mkdir -p "$DEST_DIR"

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

echo "→ fetching SheetJS ${VERSION} from ${URL}"
if curl -fsSL --max-time 120 -o "$tmp" "$URL" \
  && [ -s "$tmp" ] \
  && tar -tzf "$tmp" >/dev/null 2>&1 \
  && [ "$(tar -xzOf "$tmp" package/package.json 2>/dev/null \
        | sed -n 's/.*"version":[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)" = "$VERSION" ]; then
  mv "$tmp" "$DEST"
  echo "✓ vendored ${DEST}"
  echo "  size:   $(wc -c <"$DEST") bytes"
  echo "  sha256: $(shasum -a 256 "$DEST" | cut -d' ' -f1)"
else
  if [ -f "$DEST" ]; then
    echo "! CDN unreachable or download invalid — keeping the committed ${DEST}"
  else
    echo "✗ CDN unreachable and no committed ${DEST} to fall back to" >&2
    exit 1
  fi
fi
