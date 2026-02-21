# GitHub Push Helper Script
# This script helps you push your code to GitHub

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        AgriChain - GitHub Push Helper                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
$gitStatus = git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    Write-Host "Run: git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git repository is initialized" -ForegroundColor Green
Write-Host ""

# Check if there are commits
$commitCount = git rev-list --count HEAD 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No commits found!" -ForegroundColor Red
    Write-Host "Run: git add . && git commit -m 'Initial commit'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found $commitCount commit(s)" -ForegroundColor Green
Write-Host ""

# Check if remote exists
$remoteUrl = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Remote 'origin' already configured:" -ForegroundColor Green
    Write-Host "   $remoteUrl" -ForegroundColor Gray
    Write-Host ""
    
    $pushNow = Read-Host "Do you want to push to this repository? (y/n)"
    if ($pushNow -eq 'y' -or $pushNow -eq 'Y') {
        Write-Host ""
        Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
        git branch -M main
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host "🎉 Your code is now on GitHub!" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Push failed!" -ForegroundColor Red
            Write-Host "Please check your authentication and try again." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please enter your GitHub repository URL:" -ForegroundColor Cyan
    Write-Host "Example: https://github.com/username/repository.git" -ForegroundColor Gray
    Write-Host ""
    
    $repoUrl = Read-Host "Repository URL"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "🔗 Adding remote repository..." -ForegroundColor Cyan
        git remote add origin $repoUrl
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Remote added successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
            git branch -M main
            git push -u origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
                Write-Host "🎉 Your code is now on GitHub!" -ForegroundColor Cyan
            } else {
                Write-Host ""
                Write-Host "❌ Push failed!" -ForegroundColor Red
                Write-Host "Please check your authentication and try again." -ForegroundColor Yellow
                Write-Host ""
                Write-Host "💡 Tip: You may need to use a Personal Access Token" -ForegroundColor Cyan
                Write-Host "   Get one at: https://github.com/settings/tokens" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ Failed to add remote!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No URL provided. Exiting." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
