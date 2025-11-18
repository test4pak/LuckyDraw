# NPM Scripts Guide for GitHub

Both the main website and admin panel now have npm scripts for easy GitHub operations.

## Available Scripts

### Main Website (Root Directory)

```bash
# Check git status
npm run git:status

# Add all files to staging
npm run git:add

# Commit with a custom message
npm run git:commit "Your commit message here"

# Push to GitHub
npm run git:push

# Quick deploy (add + commit + push with auto timestamp)
npm run deploy

# Deploy with custom message
npm run deploy:msg "Your custom commit message"
```

### Admin Panel

```bash
cd admin-panel

# Check git status
npm run git:status

# Add all files to staging
npm run git:add

# Commit with a custom message
npm run git:commit "Your commit message here"

# Push to GitHub
npm run git:push

# Quick deploy (add + commit + push with auto timestamp)
npm run deploy

# Deploy with custom message
npm run deploy:msg "Your custom commit message"
```

## Usage Examples

### Quick Deploy (Recommended - Auto Timestamp)
```bash
# Main website
npm run deploy

# Admin panel
cd admin-panel
npm run deploy
```

### Deploy with Custom Message
```bash
# Main website
npm run deploy:msg "Fixed carousel prize count display"

# Admin panel
cd admin-panel
npm run deploy:msg "Added new event management feature"
```

### Step by Step (Manual Control)
```bash
# Main website
npm run git:add
npm run git:commit "Fixed carousel prize count display"
npm run git:push

# Admin panel
cd admin-panel
npm run git:add
npm run git:commit "Added new event management feature"
npm run git:push
```

### Step by Step
```bash
# 1. Check what changed
npm run git:status

# 2. Add files
npm run git:add

# 3. Commit with message
npm run git:commit "Your descriptive message"

# 4. Push to GitHub
npm run git:push
```

## Notes

- **`deploy`** script automatically adds all files, commits with a timestamp, and pushes
- **`git:commit`** requires a message: `npm run git:commit "Your message"`
- All scripts work from their respective directories (root for website, admin-panel for admin)
- The token is already saved, so no authentication needed for pushes

## Alternative: Use Batch Scripts

You can also use the batch scripts:
- `push-to-github.bat` (main website)
- `admin-panel/push-to-github.bat` (admin panel)

These provide an interactive experience with prompts.

