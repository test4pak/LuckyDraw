# Quick Push to GitHub

## Automated Push Scripts

I've created two scripts to automate pushing your code to GitHub:

### Option 1: Batch Script (Windows)
Double-click or run:
```bash
push-to-github.bat
```

### Option 2: PowerShell Script (Windows)
Right-click and "Run with PowerShell" or run:
```powershell
.\push-to-github.ps1
```

## What the Scripts Do:

1. ✅ Check if you're in the correct directory
2. ✅ Check if git is initialized
3. ✅ Show current changes
4. ✅ Ask for a commit message (or use default)
5. ✅ Add all changes
6. ✅ Commit with your message
7. ✅ Push to GitHub automatically

## Manual Push (Alternative)

If you prefer to push manually:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## Notes:

- The token is already saved in the git remote URL
- You don't need to authenticate each time
- The scripts will show you what's being committed before pushing
- If there are no changes, the script will let you know

