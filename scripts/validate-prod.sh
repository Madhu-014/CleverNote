#!/bin/bash

# Production Deployment Validation Script
# Run this before deploying to ensure everything is configured correctly

set -e

echo "======================================"
echo "🔍 Production Deployment Validation"
echo "======================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSES=0
FAILS=0
WARNINGS=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSES++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILS++))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

# 1. Check Node version
echo ""
echo "📦 Checking Node.js..."
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION == v20* ]] || [[ $NODE_VERSION == v18* ]]; then
  check_pass "Node.js version: $NODE_VERSION (recommended: v20+)"
else
  check_warn "Node.js version: $NODE_VERSION (recommended: v20+)"
fi

# 2. Check npm version
npm -v > /dev/null 2>&1 && check_pass "npm installed" || check_fail "npm not found"

# 3. Check Git repo
echo ""
echo "🔧 Checking Git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  check_pass "Git repository initialized"
  
  # Check .gitignore
  if grep -q "\.env\.local" .gitignore 2>/dev/null; then
    check_pass ".env.local in .gitignore"
  else
    check_fail ".env.local NOT in .gitignore (secrets will be exposed!)"
  fi
  
  # Check if there are uncommitted changes
  if [[ -z $(git status -s) ]]; then
    check_pass "All changes committed to Git"
  else
    check_warn "Uncommitted changes in Git (push before deploy)"
  fi
else
  check_fail "Not a Git repository"
fi

# 4. Check package.json
echo ""
echo "📋 Checking package.json..."
if [ -f "package.json" ]; then
  check_pass "package.json exists"
  
  # Check for required scripts
  if grep -q '"build".*"next build"' package.json; then
    check_pass "Build script configured correctly"
  else
    check_fail "Build script not found or incorrect"
  fi
else
  check_fail "package.json not found"
fi

# 5. Check configuration files
echo ""
echo "⚙️ Checking configuration files..."

if [ -f "next.config.mjs" ]; then
  check_pass "next.config.mjs exists"
else
  check_fail "next.config.mjs not found"
fi

if [ -f "vercel.json" ]; then
  check_pass "vercel.json exists"
else
  check_warn "vercel.json not found (optional but recommended)"
fi

if [ -f ".env.example" ]; then
  check_pass ".env.example exists"
else
  check_fail ".env.example not found"
fi

# 6. Check environment variables
echo ""
echo "🔐 Checking environment variables..."

ENV_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "NEXT_PUBLIC_CONVEX_URL"
  "GROQ_API_KEY"
  "GEMINI_API_KEY"
)

if [ -f ".env.local" ]; then
  check_pass ".env.local found (keep this private!)"
  
  MISSING=0
  for var in "${ENV_VARS[@]}"; do
    if grep -q "^$var=" .env.local 2>/dev/null; then
      VALUE=$(grep "^$var=" .env.local | cut -d'=' -f2- | head -c 20)
      check_pass "$var: ${VALUE}..."
    else
      check_fail "$var: NOT SET"
      ((MISSING++))
    fi
  done
  
  if [ $MISSING -eq 0 ]; then
    check_pass "All required environment variables set"
  else
    check_fail "$MISSING environment variables missing"
  fi
else
  check_warn ".env.local not found (create from .env.example)"
fi

# 7. Check build output
echo ""
echo "🏗️ Checking build..."

if command -v npm &> /dev/null; then
  check_pass "npm found in PATH"
  
  # Check if node_modules exists
  if [ -d "node_modules" ]; then
    check_pass "Dependencies installed (node_modules exists)"
  else
    check_warn "node_modules not found (run: npm install)"
  fi
else
  check_fail "npm not found in PATH"
fi

# 8. Check API routes
echo ""
echo "🔌 Checking API routes..."

if [ -f "app/api/ai-chat/route.js" ]; then
  check_pass "AI chat route exists"
else
  check_fail "AI chat route not found"
fi

if [ -f "app/api/pdf-loader/route.js" ]; then
  check_pass "PDF loader route exists"
else
  check_fail "PDF loader route not found"
fi

# 9. Check Convex configuration
echo ""
echo "🗄️ Checking Convex..."

if [ -f "convex.json" ] || [ -d "convex" ]; then
  check_pass "Convex configuration found"
  
  if [ -f "convex/schema.js" ]; then
    check_pass "Convex schema exists"
  else
    check_warn "Convex schema not found"
  fi
else
  check_fail "Convex configuration not found"
fi

# 10. Security checks
echo ""
echo "🔒 Security checks..."

# Check for hardcoded secrets
if grep -r "sk_live_" app/ convex/ 2>/dev/null | grep -v ".env.example" > /dev/null; then
  check_fail "Hardcoded secrets found in code! (search for 'sk_')"
else
  check_pass "No hardcoded secrets found"
fi

if grep -r "GROQ_API_KEY\s*=" app/ convex/ 2>/dev/null | grep -v ".env.example" | grep -v "process.env" > /dev/null; then
  check_fail "API keys hardcoded (use process.env only)"
else
  check_pass "No API keys hardcoded"
fi

# 11. File size check
echo ""
echo "📊 Checking file sizes..."

if [ -d "public" ]; then
  PUBLIC_SIZE=$(du -sh public/ 2>/dev/null | cut -f1)
  check_pass "Public folder size: $PUBLIC_SIZE"
fi

# 12. Summary
echo ""
echo "======================================"
echo "📊 Validation Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASSES"
echo -e "${RED}Failed:${NC} $FAILS"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo "======================================"

# Final verdict
if [ $FAILS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    exit 0
  else
    echo ""
    echo -e "${YELLOW}⚠️ Ready to deploy, but fix warnings first.${NC}"
    exit 0
  fi
else
  echo ""
  echo -e "${RED}❌ Fix failures before deploying!${NC}"
  exit 1
fi
