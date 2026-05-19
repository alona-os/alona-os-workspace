#!/usr/bin/env bash
# Lists file-level diffs between TWO v0 export trees under ref/ (baseline vs -new).
# It does NOT: compare ref/ to Phoenix, prove LiveView parity, or catch missing ports.
# After you promote -new → baseline, there is no -new folder until the next drop — the script will exit with an error until you add ref/alona-os-ui-design-new again.
#
# Run from repo root: ./scripts/v0-ui-diff.sh [--unified]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OLD="${ROOT}/ref/alona-os-ui-design"
NEW="${ROOT}/ref/alona-os-ui-design-new"

if [[ ! -d "$OLD" ]] || [[ ! -d "$NEW" ]]; then
  echo "expected both ref/alona-os-ui-design and ref/alona-os-ui-design-new under ${ROOT}" >&2
  exit 1
fi

UNIFIED=false
if [[ "${1:-}" == "--unified" ]]; then
  UNIFIED=true
fi

echo "=== summary (recursive; excludes node_modules, .next) ==="
diff -rq "$OLD" "$NEW" --exclude=node_modules --exclude=.next || true

in_scope_relpath() {
  local r="$1"
  if [[ "$r" =~ ^app/.+\.tsx$ ]]; then
    return 0
  fi
  if [[ "$r" == "components/app-sidebar.tsx" || "$r" == "components/app-topbar.tsx" || "$r" == "components/theme-provider.tsx" ]]; then
    return 0
  fi
  if [[ "$r" =~ ^components/dashboard/.+\.tsx$ ]]; then
    return 0
  fi
  return 1
}

echo ""
echo "=== in-scope differing files (paths relative to each ref tree) ==="
found=0
while IFS= read -r line; do
  # diff -rq lines: "Files X and Y differ" or "Only in ..."
  if [[ "$line" =~ ^Files[[:space:]]+(.*)[[:space:]]and[[:space:]]+(.*)[[:space:]]differ$ ]]; then
    a="${BASH_REMATCH[1]}"
    b="${BASH_REMATCH[2]}"
    rel="${a#"$OLD"/}"
    if in_scope_relpath "$rel"; then
      found=1
      echo "$rel"
      if $UNIFIED; then
        diff -u "$OLD/$rel" "$NEW/$rel" || true
        echo ""
      fi
    fi
  fi
done < <(diff -rq "$OLD" "$NEW" --exclude=node_modules --exclude=.next 2>/dev/null || true)

if [[ "$found" -eq 0 ]]; then
  echo "(none under app/**/*.tsx, components/dashboard/**, or shell tsx)"
fi

echo ""
echo "=== note ==="
echo "This only compares the two ref trees. Gaps between ref and alona-os-core (e.g. topbar"
echo "content) do not appear here — use the shell parity checklist in /sync-v0-ui-to-liveview."
