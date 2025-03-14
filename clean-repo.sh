#!/bin/bash

# Backup current branch
current_branch=$(git symbolic-ref --short HEAD)

# Remove .env file from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Remove any other potential files with secrets
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config.js config.json" \
  --prune-empty --tag-name-filter cat -- --all

# Force garbage collection
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Create .gitignore backup
cp .gitignore .gitignore.backup 2>/dev/null || :

# Update .gitignore
cat >> .gitignore << EOL
# Environment Variables
.env
.env.local
.env.*.local
.env.development
.env.test
.env.production

# API Keys and Secrets
*.pem
*.key
config.js
config.json
**/config/secrets.*
**/secrets.*
**/credentials.*
serviceAccount*.json

# Local development
*.log
.DS_Store
.idea/
.vscode/
node_modules/
coverage/
build/
dist/
EOL

echo "Repository cleaned. Please review the changes and force push to remote with:"
echo "git push origin $current_branch --force" 