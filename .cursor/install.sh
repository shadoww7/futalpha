#!/usr/bin/env bash
# Idempotent setup for the Luau toolchain used to work with the scripts in this
# repository. These files are Roblox/Luau scripts (they use Luau-only syntax
# such as binary literals `0b1010` and the `bit32` library), so a Luau
# interpreter/compiler is the right development tool for parsing, syntax
# checking, and running standalone Luau code.
set -euo pipefail

LUAU_VERSION="0.739"
INSTALL_DIR="/usr/local/bin"
MARKER="${INSTALL_DIR}/.luau-version"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  fi
fi

if command -v luau >/dev/null 2>&1 \
  && [ -f "$MARKER" ] \
  && [ "$(cat "$MARKER" 2>/dev/null || true)" = "$LUAU_VERSION" ]; then
  echo "Luau ${LUAU_VERSION} already installed at $(command -v luau)."
else
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  url="https://github.com/luau-lang/luau/releases/download/${LUAU_VERSION}/luau-ubuntu.zip"
  echo "Downloading Luau ${LUAU_VERSION} from ${url} ..."
  curl -sSL -o "$tmp/luau.zip" "$url"
  unzip -o -q "$tmp/luau.zip" -d "$tmp/luau"
  $SUDO install -m755 \
    "$tmp/luau/luau" \
    "$tmp/luau/luau-analyze" \
    "$tmp/luau/luau-ast" \
    "$tmp/luau/luau-compile" \
    "$INSTALL_DIR/"
  echo "$LUAU_VERSION" | $SUDO tee "$MARKER" >/dev/null
  echo "Installed Luau ${LUAU_VERSION} to ${INSTALL_DIR}."
fi

echo "luau binaries:"
command -v luau luau-analyze luau-ast luau-compile

echo "Luau runtime check:"
check_script="$(mktemp --suffix=.luau)"
printf '%s\n' 'print("Luau runtime OK -", "1+2 =", 1 + 2, "| bit32.bxor(5,3) =", bit32.bxor(5, 3))' >"$check_script"
luau "$check_script"
rm -f "$check_script"
