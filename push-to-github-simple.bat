@echo off
echo ========================================
echo   Pushing Latest Changes to GitHub
echo ========================================
echo.

echo Adding all changes...
git add .
echo Done!
echo.

echo Committing changes...
git commit -m "Add Supply Chain Map with floating button and fix all errors"
echo Done!
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Successfully pushed to GitHub!
echo ========================================
echo.
echo Repository: https://github.com/harish-offl/kpr-fiestaa.git
echo.

pause
