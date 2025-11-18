# GitHub Setup Guide

This guide will help you set up separate GitHub repositories for the main website and admin panel.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. GitHub CLI (optional, but recommended) or you can use the web interface

## Setup Instructions

### 1. Main Website Repository

#### Step 1: Create a new repository on GitHub
1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `luckydraw-pk` (or your preferred name)
5. Choose **Private** or **Public** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

#### Step 2: Connect and push your main website code
```bash
# Navigate to the main project directory
cd d:\Web_Project

# Add all files (admin-panel will be ignored)
git add .

# Create initial commit
git commit -m "Initial commit: LuckyDraw.pk main website"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/luckydraw-pk.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Admin Panel Repository

#### Step 1: Create a new repository on GitHub
1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `luckydraw-pk-admin` (or your preferred name)
5. Choose **Private** (recommended for admin panels)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

#### Step 2: Connect and push your admin panel code
```bash
# Navigate to the admin panel directory
cd d:\Web_Project\admin-panel

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: LuckyDraw.pk Admin Panel"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/luckydraw-pk-admin.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Using SSH Instead of HTTPS (Optional but Recommended)

If you prefer SSH authentication:

1. **Generate SSH key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH key to GitHub**:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

3. **Use SSH URLs instead**:
   ```bash
   # Main website
   git remote set-url origin git@github.com:YOUR_USERNAME/luckydraw-pk.git
   
   # Admin panel
   git remote set-url origin git@github.com:YOUR_USERNAME/luckydraw-pk-admin.git
   ```

## Future Updates

### To push updates to main website:
```bash
cd d:\Web_Project
git add .
git commit -m "Your commit message"
git push
```

### To push updates to admin panel:
```bash
cd d:\Web_Project\admin-panel
git add .
git commit -m "Your commit message"
git push
```

## Important Notes

1. **Environment Variables**: Make sure `.env.local` files are in `.gitignore` (they already are)
2. **Never commit sensitive data**: API keys, passwords, or secrets
3. **Separate repos**: The main website repo ignores the `admin-panel` folder, and the admin panel is a completely separate repository
4. **Supabase credentials**: Keep your Supabase credentials secure and never commit them

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### If you need to change the remote URL:
```bash
git remote set-url origin YOUR_NEW_REPO_URL
```

### To check your current remotes:
```bash
git remote -v
```

