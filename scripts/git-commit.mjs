import { execSync } from 'child_process';

try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  console.log('Current Git Status:\n' + (status || '(clean)'));

  // Stage any modified or untracked relevant files
  execSync('git add -A', { stdio: 'inherit' });
  
  const statusAfterAdd = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (statusAfterAdd.trim()) {
    execSync('git commit -m "feat: integrate Google Stitch prototype with floating cards, levitation animations, and executive dashboard"', { stdio: 'inherit' });
    console.log('Committed new changes.');
  } else {
    console.log('Working tree is clean, proceeding to push.');
  }

  const pushOutput = execSync('git push origin main', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('Push output:\n' + pushOutput);
  console.log('✅ Successfully pushed to GitHub origin/main');
} catch (err) {
  console.error('Git error:', err.message);
  if (err.stdout) console.log('stdout:', err.stdout.toString());
  if (err.stderr) console.error('stderr:', err.stderr.toString());
}
