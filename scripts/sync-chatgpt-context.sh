#!/usr/bin/env bash
# Build a docs-only upload bundle for the ChatGPT project "alona-iot".
# Never includes application source (.ex, .exs, config, migrations, scripts, assets).
# ChatGPT Projects have no public push API — upload memory/chatgpt/ manually.
#
# Usage (from repo root):
#   ./scripts/sync-chatgpt-context.sh           # → memory/chatgpt/alona-iot/
#   ./scripts/sync-chatgpt-context.sh --zip     # → memory/chatgpt/alona-iot.zip
#   ./scripts/sync-chatgpt-context.sh --open    # reveal bundle in Finder (macOS)
#   ./scripts/sync-chatgpt-context.sh --list    # dry-run: print paths only
#
# Manifest: scripts/chatgpt-context.manifest (docs only). See scripts/README-chatgpt-sync.md

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="${ROOT}/scripts/chatgpt-context.manifest"
MEMORY="${ROOT}/memory"
EXPORT_CHATGPT="${MEMORY}/chatgpt"
OUT_DIR="${EXPORT_CHATGPT}/alona-iot"
ZIP_PATH="${EXPORT_CHATGPT}/alona-iot.zip"
CHATGPT_RULES_SRC="${ROOT}/scripts/chatgpt/CHATGPT_RULES.md"

DO_ZIP=false
DO_OPEN=false
DO_LIST=false

for arg in "$@"; do
  case "$arg" in
    --zip) DO_ZIP=true ;;
    --open) DO_OPEN=true ;;
    --list) DO_LIST=true ;;
    -h | --help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$MANIFEST" ]]; then
  echo "missing manifest: $MANIFEST" >&2
  exit 1
fi

# expand manifest globs from repo root
trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

should_skip_relpath() {
  case "$1" in
    ref/*) return 0 ;;
    */_build/* | */deps/* | */node_modules/* | */.git/* | */priv/static/*) return 0 ;;
    .DS_Store | */.DS_Store) return 0 ;;
    *) return 1 ;;
  esac
}

# docs-only policy: markdown and cursor rules only
allowed_docs_relpath() {
  case "$1" in
    *.md | *.mdc) return 0 ;;
    *) return 1 ;;
  esac
}

emit_relpath() {
  local relpath="$1"
  should_skip_relpath "$relpath" && return
  if ! allowed_docs_relpath "$relpath"; then
    echo "skip (not docs): $relpath" >&2
    return
  fi
  printf '%s\n' "$relpath"
}

# macOS bash 3.2 does not expand ** in manifest globs; use find for those patterns.
expand_pattern() {
  local pattern="$1"
  local abs relpath base suffix

  if [[ "$pattern" != *[\*\?]* ]]; then
    if [[ -f "$ROOT/$pattern" ]]; then
      emit_relpath "$pattern"
    fi
    return
  fi

  if [[ "$pattern" != *"**"* ]]; then
    shopt -s nullglob
    for abs in "$ROOT"/$pattern; do
      [[ -f "$abs" ]] || continue
      emit_relpath "${abs#$ROOT/}"
    done
    shopt -u nullglob
    return
  fi

  base="${pattern%%/\*\**}"
  suffix="${pattern#${base}/\*\*/}"

  case "$suffix" in
    lib/**/*.ex)
      while IFS= read -r abs; do
        emit_relpath "${abs#$ROOT/}"
      done < <(find "$ROOT/$base" -type f -path '*/lib/*' -name '*.ex' 2>/dev/null)
      ;;
    test/**/*.exs)
      while IFS= read -r abs; do
        emit_relpath "${abs#$ROOT/}"
      done < <(find "$ROOT/$base" -type f -path '*/test/*' -name '*.exs' 2>/dev/null)
      ;;
    test/support/**/*)
      while IFS= read -r abs; do
        emit_relpath "${abs#$ROOT/}"
      done < <(find "$ROOT/$base" -type f -path '*/test/support/*' 2>/dev/null)
      ;;
    mix.exs)
      while IFS= read -r abs; do
        emit_relpath "${abs#$ROOT/}"
      done < <(find "$ROOT/$base" -type f -name 'mix.exs' 2>/dev/null)
      ;;
    priv/repo/migrations/*.exs)
      while IFS= read -r abs; do
        emit_relpath "${abs#$ROOT/}"
      done < <(find "$ROOT/$base" -type f -path '*/priv/repo/migrations/*' -name '*.exs' 2>/dev/null)
      ;;
    priv/repo/seeds.exs)
      while IFS= read -r abs; do
        emit_relpath "${abs#$ROOT/}"
      done < <(find "$ROOT/$base" -type f -path '*/priv/repo/seeds.exs' 2>/dev/null)
      ;;
    *)
      echo "warn: unsupported ** pattern: $pattern" >&2
      ;;
  esac
}

collect_paths() {
  local line pattern count=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(trim "$line")"
    [[ -z "$line" ]] && continue
    [[ "$line" == !* ]] && continue

    pattern="$line"
    count=0
    while IFS= read -r relpath; do
      [[ -n "$relpath" ]] || continue
      printf '%s\n' "$relpath"
      count=$((count + 1))
    done < <(expand_pattern "$pattern")

    if [[ "$count" -eq 0 ]]; then
      echo "warn: no match for manifest pattern: $pattern" >&2
    fi
  done < "$MANIFEST"
}

PATHS=()
while IFS= read -r relpath; do
  [[ -n "$relpath" ]] && PATHS+=("$relpath")
done < <(collect_paths | sort -u)

if [[ -f "$CHATGPT_RULES_SRC" ]]; then
  PATHS+=("CHATGPT_RULES.md")
fi

if [[ ${#PATHS[@]} -eq 0 ]]; then
  echo "no files matched manifest — check paths and that alona-os-core exists" >&2
  exit 1
fi

if $DO_LIST; then
  printf '%s\n' "${PATHS[@]}"
  echo "--- ${#PATHS[@]} files ---"
  exit 0
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

for relpath in "${PATHS[@]}"; do
  if [[ "$relpath" == "CHATGPT_RULES.md" ]]; then
    cp "$CHATGPT_RULES_SRC" "${OUT_DIR}/CHATGPT_RULES.md"
    continue
  fi

  src="${ROOT}/${relpath}"
  dest="${OUT_DIR}/${relpath}"
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
done

GIT_SHA="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
GIT_BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > "${OUT_DIR}/_SYNC_METADATA.txt" <<EOF
generated_at: ${GENERATED_AT}
git_sha: ${GIT_SHA}
git_branch: ${GIT_BRANCH}
file_count: ${#PATHS[@]}
source_repo: ${ROOT}
manifest: scripts/chatgpt-context.manifest

bundle_policy: docs-only (no application source code)
upload_folder: memory/chatgpt/alona-iot/
upload_zip: memory/chatgpt/alona-iot.zip
Upload into your ChatGPT project "alona-iot".
Replace previous uploads when AGENTS.md or rules change materially.
EOF

if $DO_ZIP; then
  mkdir -p "$EXPORT_CHATGPT"
  rm -f "$ZIP_PATH"
  (cd "$EXPORT_CHATGPT" && zip -rq "$(basename "$ZIP_PATH")" "$(basename "$OUT_DIR")")
  echo "zip: $ZIP_PATH"
fi

echo "bundle: $OUT_DIR (${#PATHS[@]} files)"
echo "metadata: ${OUT_DIR}/_SYNC_METADATA.txt"

if $DO_OPEN; then
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "$OUT_DIR"
  else
    echo "open: $OUT_DIR"
  fi
fi
