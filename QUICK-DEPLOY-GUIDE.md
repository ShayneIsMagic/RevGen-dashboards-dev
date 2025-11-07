# 🚀 Quick Deploy Guide - Choose Your Method

The site is showing 404 because we need to push the fixed code to GitHub. Choose the easiest method for you:

---

## ⚡ METHOD 1: Use GitHub Desktop (Easiest!)

If you have [GitHub Desktop](https://desktop.github.com/) installed:

1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose: `/Users/skroy/Desktop/RevGen-dashboards-dev-local`
4. Click "Push origin" button
5. Done! ✅

---

## 🔑 METHOD 2: Quick HTTPS Push (5 minutes)

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Name it: "RevGen Deploy"
3. Expiration: 90 days (or your preference)
4. Check these boxes:
   - ✅ `repo` (all repo access)
5. Click "Generate token" at bottom
6. **Copy the token** (you'll use it as your password)

### Step 2: Change to HTTPS and Push

Open your terminal and run these commands:

```bash
cd /Users/skroy/Desktop/RevGen-dashboards-dev-local

# Switch to HTTPS authentication
git remote set-url origin https://github.com/ShayneIsMagic/RevGen-dashboards-dev.git

# Push (use your token as password when prompted)
git push -u origin main --force
```

When prompted:
- **Username**: Your GitHub username
- **Password**: Paste the token you just created

---

## 🔐 METHOD 3: Set Up SSH Keys (One-time setup)

### Generate SSH Key

```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter for default location
# Press Enter twice for no passphrase (or set one if you prefer)

# Copy the public key
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### Add to GitHub

1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "Mac - RevGen"
4. Paste the key (already copied from command above)
5. Click "Add SSH key"

### Test and Push

```bash
# Test SSH connection
ssh -T git@github.com

# Push to GitHub
cd /Users/skroy/Desktop/RevGen-dashboards-dev-local
git push -u origin main --force
```

---

## ✅ After Successful Push

1. **Monitor deployment** (takes ~2-3 minutes):
   - https://github.com/ShayneIsMagic/RevGen-dashboards-dev/actions

2. **Check your live dashboards**:
   - Pipeline Manager: https://shayneismagic.github.io/RevGen-dashboards-dev/
   - Financial Dashboard: https://shayneismagic.github.io/RevGen-dashboards-dev/financial/

3. **Wait 2-3 minutes** for GitHub Actions to build and deploy

---

## 🆘 Troubleshooting

### "Permission denied"
- You need to authenticate with one of the methods above

### "Repository not found"
- Make sure you're logged into the correct GitHub account
- Verify you have access to: https://github.com/ShayneIsMagic/RevGen-dashboards-dev

### Still getting 404 after push
- Wait 3-5 minutes for deployment to complete
- Check GitHub Actions for build errors: https://github.com/ShayneIsMagic/RevGen-dashboards-dev/actions
- Clear browser cache and try again

---

## 📝 What's Ready to Deploy

✅ 3 commits ready:
1. Fix GitHub Pages deployment configuration
2. Add deployment status and instructions
3. Add automated deploy script

✅ Build tested and verified working
✅ Static files generated correctly
✅ GitHub Actions workflow configured

**You just need to push!** Choose your method above and let's get this live! 🎉

