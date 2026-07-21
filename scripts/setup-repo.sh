#!/bin/sh
# scripts/setup-repo.sh
#
# Applies repository merge settings and branch protection for this public,
# personal (cocodedk) repo. Requires the GitHub CLI (gh) authenticated with
# admin rights on the repo.
#
# Run this ONCE, AFTER the first CI run on GitHub has produced a "verify"
# status check — branch protection can only require a status check that has
# run at least once.
set -eu

# --- Derive repo identity from the current gh context ------------------------
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)
OWNER=$(gh repo view --json owner -q .owner.login)

echo ""
echo "=== Repository Setup: $REPO ==="
echo ""
echo "Repository:      $REPO"
echo "Default branch:  $DEFAULT_BRANCH"
echo "Owner:           $OWNER"
echo ""

# --- Repository-level merge settings ------------------------------------------
echo "Applying merge settings..."
gh repo edit "$REPO" \
  --delete-branch-on-merge \
  --enable-squash-merge \
  --enable-rebase-merge \
  --enable-merge-commit=false

echo "OK Merge strategy: squash + rebase only, auto-delete head branches"

# --- Branch protection ---------------------------------------------------------
# "contexts" must match the CI job name in .github/workflows/ci.yml (job: verify).
echo "Applying branch protection to '$DEFAULT_BRANCH'..."

PROTECTION_PAYLOAD='{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "block_creations": false
}'

set +e
PROTECTION_OUTPUT=$(printf '%s' "$PROTECTION_PAYLOAD" | gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/$REPO/branches/$DEFAULT_BRANCH/protection" \
  --input - 2>&1)
PROTECTION_STATUS=$?
set -e

if [ "$PROTECTION_STATUS" -ne 0 ]; then
  if printf '%s' "$PROTECTION_OUTPUT" | grep -qi "Upgrade to GitHub Pro"; then
    # Branch protection on private repos requires a paid plan. This repo is
    # public, so this branch should not normally be reached — kept as a
    # graceful fallback rather than a hard failure.
    echo ""
    echo "NOTE: Branch protection was SKIPPED."
    echo "  GitHub refused with 'Upgrade to GitHub Pro'. That message applies to"
    echo "  private repos on GitHub Free; this repo is public, so seeing it here"
    echo "  is unexpected — double-check that gh is authenticated with admin"
    echo "  rights on $REPO."
    echo "  The local pre-push hook (.githooks/pre-push) remains the fallback"
    echo "  guard against force-push and deletion of protected branches."
    exit 0
  fi

  echo "ERROR: Failed to apply branch protection:" >&2
  printf '%s\n' "$PROTECTION_OUTPUT" >&2
  exit 1
fi

echo "OK Branch protection applied to '$DEFAULT_BRANCH'"

# --- CODEOWNERS (auto-requests review from the owner; does not block, 0 approvals) --
echo "Writing .github/CODEOWNERS..."
mkdir -p .github
printf '* @%s\n' "$OWNER" > .github/CODEOWNERS
echo "OK .github/CODEOWNERS written"

# --- Summary -------------------------------------------------------------------
echo ""
echo "Summary of active rules on '$DEFAULT_BRANCH':"
echo "  - Required status checks:  verify (strict: must be up to date)"
echo "  - Enforce for admins:      false"
echo "  - Required PR approvals:   0 (dismiss_stale_reviews: false, code owner reviews not required)"
echo "  - Force pushes:            blocked"
echo "  - Branch deletion:         blocked"
echo "  - Linear history required: false"
echo "  - Conversation resolution required: false"
echo "  - Delete branch on merge:  enabled"
echo "  - Squash merge:            enabled"
echo "  - Rebase merge:            enabled"
echo "  - Merge commit:            disabled"
echo "  - CODEOWNERS:              * @$OWNER"
echo ""
echo "Reminder: commit and push .github/CODEOWNERS —"
echo "  git add .github/CODEOWNERS && git commit -m 'chore: add CODEOWNERS' && git push"
