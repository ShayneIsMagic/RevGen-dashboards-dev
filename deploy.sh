#!/bin/bash

# Deploy script for RevGen Dashboards to GitHub Pages
echo "🚀 Deploying RevGen Dashboards to GitHub Pages..."
echo ""
echo "Repository: https://github.com/ShayneIsMagic/RevGen-dashboards-dev"
echo "Branch: main"
echo ""

# Change to the repository directory
cd "$(dirname "$0")"

# Check if we have uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Committing them first..."
    git add .
    read -p "Enter commit message: " commit_msg
    git commit -m "$commit_msg"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔄 GitHub Actions is now building and deploying your site..."
    echo ""
    echo "📊 Monitor deployment:"
    echo "   https://github.com/ShayneIsMagic/RevGen-dashboards-dev/actions"
    echo ""
    echo "🌐 Your dashboards will be available at:"
    echo "   Pipeline Manager:    https://shayneismagic.github.io/RevGen-dashboards-dev/"
    echo "   Financial Dashboard: https://shayneismagic.github.io/RevGen-dashboards-dev/financial/"
    echo ""
    echo "⏱️  Deployment typically takes 2-3 minutes..."
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo ""
    echo "💡 If using 2FA, create a Personal Access Token:"
    echo "   https://github.com/settings/tokens"
    echo "   Use the token as your password when prompted."
fi

