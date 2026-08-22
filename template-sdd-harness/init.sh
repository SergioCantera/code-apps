#!/usr/bin/env bash
# init.sh — Verification and initialization of the environment for Code Apps (pnpm)
#
# This script is executed by the agent at the START of a session and before
# declaring any task as `done`. If it fails, the session should not proceed.
#
# Expected output: clear exit codes and blocks marked with [OK]/[FAIL].

set -u
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail()  { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

EXIT_CODE=0

echo "── 1. Verifying environment ─────────────────────────────"

# Node.js available
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js is not installed"
  exit 1
fi
ok "Node.js -> $(node --version)"

# pnpm available
if ! command -v pnpm >/dev/null 2>&1; then
  fail "pnpm is not installed. Install it using 'corepack enable' or npm."
  exit 1
fi
ok "pnpm -> $(pnpm --version)"

# Verify node_modules and pnpm lockfile exist
if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
  fail "Environment not bootstrapped. Run 'pnpm install' first."
  exit 1
fi
ok "pnpm dependencies are installed and locked"

echo ""
echo "── 2. Verifying base harness files ──────────────"

for f in AGENTS.md feature_list.json progress/current.md docs/architecture.md docs/conventions.md docs/verification.md CHECKPOINTS.md; do
  if [ ! -f "$f" ]; then
    fail "Missing base file: $f"
    EXIT_CODE=1
  else
    ok "Existe $f"
  fi
done

echo ""
echo "── 3. Validating feature_list.json and specs ─────────────"

node - <<'JS'
const fs = require('fs');
const path = require('path');

try {
    const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf8'));
    const valid = new Set(["pending", "spec_ready", "in_progress", "done", "blocked"]);
    
    const in_progress = data.features.filter(f => f.status === "in_progress");
    if (in_progress.length > 1) {
        console.log(`[FAIL]  Hay ${in_progress.length} features en in_progress (máximo 1)`);
        process.exit(1);
    }
    
    const requires_spec = new Set(["spec_ready", "in_progress", "done"]);
    const spec_errors = [];
    
    for (const f of data.features) {
        if (!valid.has(f.status)) {
            console.log(`[FAIL]  Invalid status in feature ${f.id}: ${f.status}`);
            process.exit(1);
        }
        
        if (f.sdd && requires_spec.has(f.status)) {
            const spec_dir = path.join("specs", f.name);
            for (const fname of ["requirements.md", "design.md", "tasks.md"]) {
                if (!fs.existsSync(path.join(spec_dir, fname))) {
                    spec_errors.push(
                        `feature ${f.id} (${f.name}) en ${f.status} sin ${spec_dir}/${fname}`
                    );
                }
            }
        }
    }
    
    if (spec_errors.length > 0) {
        spec_errors.forEach(e => console.log(`[FAIL]  ${e}`));
        process.exit(1);
    }
    
    console.log(`[OK]    feature_list.json valid (${data.features.length} features)`);
    console.log(`[OK]    Specs present for sdd features with non-pending status`);
} catch (e) {
    console.log(`[FAIL]  feature_list.json or specs invalid: ${e.message}`);
    process.exit(1);
}
JS

if [ $? -ne 0 ]; then EXIT_CODE=1; fi

echo ""
echo "── 4. Running Linter, TypeScript and Tests ────────────"

# 4a. Check TypeScript compilation via pnpm
echo "Verifying types with TypeScript..."
if pnpm exec tsc --noEmit >/dev/null 2>&1 || pnpm run tsc -- --noEmit >/dev/null 2>&1; then
  ok "TypeScript compilation successful"
else
  fail "TypeScript type errors"
  EXIT_CODE=1
fi

# 4b. Run tests via pnpm (Assumes Vitest/Jest setup in package.json)
echo "Running test suite..."
if pnpm test -- --watch=false --passWithNoTests; then
  ok "All tests pass"
else
  fail "There are failing tests or the Vitest environment cannot be initialized."
  EXIT_CODE=1
fi

echo ""
echo "── 5. Resumen ──────────────────────────────────────────"

if [ $EXIT_CODE -eq 0 ]; then
  ok "Environment ready. You can start working on the Code App."
else
  fail "Environment NOT ready. Resolve the errors before proceeding."
fi

exit $EXIT_CODE