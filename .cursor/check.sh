#!/usr/bin/env bash
# Syntax/compile-check every Lua/Luau script in the repository.
# Uses `luau-compile` which compiles source to bytecode without executing it,
# so it validates syntax even though these scripts depend on the Roblox runtime
# (globals like `game`) at run time.
set -uo pipefail

cd "$(dirname "$0")/.."

pass=0
fail=0
failed_files=()

for f in *; do
  [ -f "$f" ] || continue
  case "$f" in
    .*) continue ;;
  esac
  if luau-compile --binary "$f" >/dev/null 2>/tmp/luau-check-err.txt; then
    echo "OK    : $f"
    pass=$((pass + 1))
  else
    echo "FAIL  : $f -> $(head -1 /tmp/luau-check-err.txt)"
    fail=$((fail + 1))
    failed_files+=("$f")
  fi
done

echo "----"
echo "pass=${pass} fail=${fail}"
if [ "$fail" -ne 0 ]; then
  printf 'Failed: %s\n' "${failed_files[@]}"
  exit 1
fi
