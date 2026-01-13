#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('GitHub Pages Deployment Helper\n');

const newslettersDir = path.join(__dirname, 'newsletters');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

// Check if newsletters directory exists
if (!fs.existsSync(newslettersDir)) {
  console.error('❌ No newsletters directory found. Generate at least one newsletter first.');
  process.exit(1);
}

// Check if this is already a git repo
const isGitRepo = fs.existsSync(path.join(newslettersDir, '.git'));

if (!isGitRepo) {
  console.log('Setting up Git repository in newsletters folder...\n');

  try {
    // Initialize git repo in newsletters directory
    execSync('git init', { cwd: newslettersDir, stdio: 'inherit' });

    // Create .gitignore
    fs.writeFileSync(
      path.join(newslettersDir, '.gitignore'),
      '*.txt\n.DS_Store\n'
    );

    console.log('\n✅ Git repository initialized in newsletters/\n');
  } catch (error) {
    console.error('❌ Error initializing git:', error.message);
    process.exit(1);
  }
}

console.log('Next steps to deploy to GitHub Pages:\n');
console.log('1. Create a new GitHub repository (e.g., "democracy-newsletter")');
console.log('   Visit: https://github.com/new\n');

console.log('2. Run these commands:\n');
console.log('   cd newsletters');
console.log('   git add .');
console.log('   git commit -m "Initial newsletter archive"');
console.log('   git branch -M main');
console.log('   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git');
console.log('   git push -u origin main\n');

console.log('3. Enable GitHub Pages:');
console.log('   - Go to your repository settings');
console.log('   - Navigate to "Pages" section');
console.log('   - Select "main" branch as source');
console.log('   - Click Save\n');

console.log('4. Update config.json with your GitHub Pages URL:');
console.log('   "hosting": {');
console.log('     "method": "github-pages",');
console.log('     "base_url": "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"');
console.log('   }\n');

console.log('5. For automatic deployment, add this to your crontab after the newsletter generation:');
console.log('   cd newsletters && git add . && git commit -m "Daily update" && git push\n');

console.log('📝 Your newsletters will be accessible at:');
console.log('   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/\n');
