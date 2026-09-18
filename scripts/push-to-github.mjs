// Push FounderSync to GitHub using supplied GitHub Personal Access Token
import { execSync } from 'child_process';

const TOKEN = process.env.GITHUB_TOKEN || process.argv[2];
const USERNAME = '5256839venkataneeraj-cmyk';
const REPO_NAME = 'FounderSync';

if (!TOKEN) {
  console.error('Usage: node scripts/push-to-github.mjs <GITHUB_TOKEN>');
  process.exit(1);
}

async function main() {
  console.log('--- GITHUB DEPLOYMENT PIPELINE ---');
  console.log(`Checking if repository ${USERNAME}/${REPO_NAME} exists...`);

  const headers = {
    Authorization: `token ${TOKEN}`,
    'User-Agent': 'FounderSync-Deployment',
    Accept: 'application/vnd.github.v3+json',
  };

  const checkRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO_NAME}`, { headers });

  if (checkRes.ok) {
    const existing = await checkRes.json();
    console.log(`✓ Repository exists: ${existing.html_url}`);
  }

  // Configure remote with authenticated token
  const authRemoteUrl = `https://${TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git`;
  const cleanRemoteUrl = `https://github.com/${USERNAME}/${REPO_NAME}.git`;

  try {
    execSync('git remote remove origin', { stdio: 'ignore' });
  } catch {
    // ignore
  }

  execSync(`git remote add origin ${authRemoteUrl}`, { stdio: 'inherit' });

  console.log('Pushing main branch to GitHub...');
  execSync('git push -u origin main --force', { stdio: 'inherit' });

  // Clean remote URL so token is never stored in .git/config on disk
  console.log('Sanitizing local git remote URL...');
  execSync(`git remote set-url origin ${cleanRemoteUrl}`, { stdio: 'inherit' });

  console.log(`\n🎉 SUCCESS! All changes have been pushed to: ${cleanRemoteUrl}`);
}

main().catch((err) => {
  console.error('Push failed:', err.message);
  process.exit(1);
});
