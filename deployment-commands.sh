#!/bin/bash
# deployment-commands.sh
# Copy and paste these commands to deploy to Vercel

# =============================================================================
# STEP 1: Local Validation
# =============================================================================
echo "Step 1: Validating local environment..."

# Make validation script executable
chmod +x scripts/validate-prod.sh

# Run validation
./scripts/validate-prod.sh
# Wait for completion - should show "✅ All checks passed"

# =============================================================================
# STEP 2: Prepare Code
# =============================================================================
echo "Step 2: Preparing code for deployment..."

# Ensure you're on main branch
git checkout main

# Verify all changes are committed
git status
# Should show "nothing to commit, working tree clean"

# If you have changes, commit them
# git add .
# git commit -m "Prepare for Vercel deployment"

# =============================================================================
# STEP 3: Push to GitHub
# =============================================================================
echo "Step 3: Pushing to GitHub..."

git push origin main
# Wait for push to complete

echo "✓ Code pushed to GitHub"

# =============================================================================
# STEP 4: Create Convex Production Deployment
# =============================================================================
echo "Step 4: Setting up Convex production..."

# Option A: If you have Convex CLI installed
npx convex env set production
# Select "production" deployment

# Deploy to production
npx convex deploy --prod
# Wait for deployment to complete

# Option B: Or use Convex dashboard directly
# 1. Go to https://dashboard.convex.dev
# 2. Click "Create Deployment"
# 3. Name it "production"
# 4. Copy the production URL

echo "⚠ Save your NEXT_PUBLIC_CONVEX_URL from Convex dashboard!"

# =============================================================================
# STEP 5: Deploy to Vercel
# =============================================================================
echo "Step 5: Deploying to Vercel..."

# Option A: Using Vercel CLI (if installed)
npm install -g vercel  # If not already installed

vercel
# Follow prompts:
# - Link to existing project or create new
# - Confirm project settings
# - Select production environment

# Option B: Or use Vercel web dashboard directly
# 1. Go to https://vercel.com/new
# 2. Click "Import Git Repository"
# 3. Select your GitHub repo
# 4. Add all environment variables from .env.example:
#    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    - CLERK_SECRET_KEY
#    - NEXT_PUBLIC_CONVEX_URL (from Convex production)
#    - GROQ_API_KEY
#    - GEMINI_API_KEY
# 5. Click "Deploy"

echo "✓ Deployment initiated on Vercel"

# =============================================================================
# STEP 6: Configure Clerk
# =============================================================================
echo "Step 6: Configuring Clerk..."

# 1. Go to https://dashboard.clerk.com
# 2. Select your application
# 3. Go to Settings > Paths > Allowed URLs
# 4. Add your Vercel domain:
#    https://your-project.vercel.app
#    https://www.your-project.vercel.app
# 5. Go to Settings > Paths and set:
#    - Sign-in URL: /sign-in
#    - Sign-up URL: /sign-up
#    - After sign-in: /dashboard
#    - After sign-up: /dashboard

echo "✓ Clerk configured"

# =============================================================================
# STEP 7: Test Deployment
# =============================================================================
echo "Step 7: Testing deployment..."

# Replace with your actual domain
DOMAIN="https://your-project.vercel.app"

echo "Testing: $DOMAIN"

# Test page loads
curl -s -o /dev/null -w "Status: %{http_code}\n" $DOMAIN/dashboard

# Test API route
curl -X POST "$DOMAIN/api/ai-chat" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}' \
  | jq '.' 2>/dev/null || echo "Test request sent"

# =============================================================================
# STEP 8: Configure Custom Domain (Optional)
# =============================================================================
echo "Step 8: Setting up custom domain (optional)..."

# If you have a custom domain:
# 1. Go to Vercel project > Settings > Domains
# 2. Add your domain
# 3. Update your domain registrar with CNAME:
#    your.domain.com → cname.vercel-dns.com
#
# Example for common registrars:
#
# GoDaddy:
#   1. Go to DNS Management
#   2. Add CNAME record pointing to cname.vercel-dns.com
#
# Namecheap:
#   1. Go to Advanced DNS
#   2. Add CNAME record
#
# Google Domains:
#   1. Go to DNS
#   2. Add CNAME record

echo "✓ Custom domain configuration (if needed)"

# =============================================================================
# STEP 9: Enable Monitoring (Optional)
# =============================================================================
echo "Step 9: Setting up monitoring..."

# Vercel Web Analytics:
# 1. Go to Vercel project > Settings > Analytics
# 2. Click "Enable Web Analytics"

# Check logs:
# 1. Vercel dashboard > Logs > Function Logs
# 2. Monitor for any errors during first week

echo "✓ Monitoring enabled"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is live at:"
echo "→ https://your-project.vercel.app"
echo ""
echo "Or with custom domain:"
echo "→ https://your.domain.com"
echo ""
echo "Next steps:"
echo "1. Sign up with your email"
echo "2. Upload a test PDF"
echo "3. Ask AI a question about the PDF"
echo "4. Monitor Vercel analytics dashboard"
echo ""
echo "Documentation:"
echo "- Quick Reference: QUICK_DEPLOY.md"
echo "- Full Guide: DEPLOYMENT_GUIDE.md"
echo "- Readiness Report: VERCEL_READINESS_REPORT.md"
echo ""
echo "=========================================="
echo ""

# Optional: Open dashboard in browser
# open "https://vercel.com/dashboard"
# open "https://dashboard.clerk.com"
# open "https://dashboard.convex.dev"

echo "Done! 🚀"
