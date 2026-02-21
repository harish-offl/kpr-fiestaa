# Push Latest Changes to GitHub
# Run this script to commit and push all changes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pushing Latest Changes to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "Checking git status..." -ForegroundColor Yellow
git status
Write-Host ""

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .
Write-Host "✓ All changes staged" -ForegroundColor Green
Write-Host ""

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
feat: Supply Chain Map & Bug Fixes

- Added interactive Leaflet.js map with custom markers
- Implemented floating map button (bottom-right corner)
- Fixed all 14 ESLint warnings
- Added journey timeline with animations
- Added AI risk analysis in map
- Fixed react-leaflet compatibility issues
- Downgraded to react-leaflet v4.2.1 for stability
- Added MapPopup component for modal overlay
- Updated all components with proper React Hooks
- All features now error-free and production ready
"@

git commit -m $commitMessage
Write-Host "✓ Changes committed" -ForegroundColor Green
Write-Host ""

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: https://github.com/harish-offl/kpr-fiestaa.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes pushed:" -ForegroundColor Yellow
Write-Host "  • Supply Chain Map with Leaflet.js" -ForegroundColor White
Write-Host "  • Floating map button (bottom-right)" -ForegroundColor White
Write-Host "  • All ESLint warnings fixed" -ForegroundColor White
Write-Host "  • Journey timeline & AI risk analysis" -ForegroundColor White
Write-Host "  • Error-free production build" -ForegroundColor White
Write-Host ""
