# GitHub Authentication Instructions

The push failed because GitHub requires authentication. Here's how to fix it:

## Option 1: Use Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "LuckyDraw Project"
4. Select scopes: Check `repo` (this gives full repository access)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Use the token when pushing
When you run `git push`, it will ask for:
- **Username**: `test4pak`
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

### Step 3: Push again
```bash
git push -u origin main
```

## Option 2: Use GitHub CLI (Alternative)

If you have GitHub CLI installed:
```bash
gh auth login
```

Then push:
```bash
git push -u origin main
```

## Option 3: Use SSH (Most Secure)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
Press Enter to accept default location.

### Step 2: Add SSH Key to GitHub
1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Go to GitHub → Settings → SSH and GPG keys → New SSH key
3. Paste your key and save

### Step 3: Change remote URL to SSH
```bash
git remote set-url origin git@github.com:test4pak/LuckyDraw.git
```

### Step 4: Push
```bash
git push -u origin main
```

## Quick Fix (Use Token Now)

The fastest way right now:

1. **Create token** (see Option 1, Step 1)
2. **Update remote URL** to include token:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/test4pak/LuckyDraw.git
   ```
   Replace `YOUR_TOKEN` with your actual token.

3. **Push**:
   ```bash
   git push -u origin main
   ```

**Note**: The token in the URL is less secure. For better security, use Option 1 and enter the token when prompted, or use SSH (Option 3).

