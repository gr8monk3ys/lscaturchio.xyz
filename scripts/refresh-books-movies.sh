#!/usr/bin/env bash
# Weekly data refresh for /books and /movies, run by launchd (see
# ops/launchd/). Works in a throwaway git worktree of origin/main so the
# developer checkout is never touched, and lands changes as a PR — never a
# direct push to main.
#
# Env:
#   REFRESH_NO_PUSH=1        validate the mechanics without pushing or opening a PR
#   REFRESH_REF=<git ref>    base the worktree on a ref other than origin/main
#                            (testing only — production runs must use origin/main)
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.bun/bin:$PATH"

REPO="$HOME/code/lscaturchio.xyz"
BRANCH="chore/refresh-media-data"
TSX="$REPO/node_modules/.bin/tsx"
REF="${REFRESH_REF:-origin/main}"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

log "fetching origin/main"
git -C "$REPO" fetch --quiet origin main

WT="$(mktemp -d)/wt"
cleanup() { git -C "$REPO" worktree remove --force "$WT" 2>/dev/null || true; }
trap cleanup EXIT
log "worktree from $REF"
git -C "$REPO" worktree add --quiet --detach "$WT" "$REF"

log "running refresh in $WT"
# tsx from the main checkout: the worktree needs no install of its own.
(cd "$WT" && "$TSX" scripts/refresh-books-movies.ts --write)

if git -C "$WT" diff --quiet; then
  log "no changes — done"
  exit 0
fi

log "changes found:"
git -C "$WT" diff --stat | tail -3

if [ "${REFRESH_NO_PUSH:-0}" = "1" ]; then
  log "REFRESH_NO_PUSH=1 — stopping before push/PR"
  exit 0
fi

cd "$WT"
git checkout --quiet -B "$BRANCH"
git add public/my-data
git commit --quiet -m "chore(data): refresh Letterboxd/Goodreads exports from RSS

Automated weekly refresh (scripts/refresh-books-movies.sh via launchd).
Data-artifact-only diff: committed CSVs under public/my-data updated from
the public RSS feeds; no code changes."
git push --quiet --force origin "HEAD:$BRANCH"

# One rolling PR: create it if absent, otherwise the push above updated it.
if ! gh pr view "$BRANCH" --json state -q .state 2>/dev/null | grep -q OPEN; then
  gh pr create \
    --head "$BRANCH" \
    --title "chore(data): refresh Letterboxd/Goodreads exports" \
    --body "Automated weekly refresh of the committed CSVs in \`public/my-data\` from the public Letterboxd/Goodreads RSS feeds. Data-artifact-only diff — see \`scripts/refresh-books-movies.ts\`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
  log "opened PR"
else
  log "updated existing PR"
fi
