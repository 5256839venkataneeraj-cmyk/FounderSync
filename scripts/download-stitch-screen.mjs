import fs from 'fs';
import path from 'path';

const htmlUrl = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1Y2IxZWE2ZTEwYmQwNzNhZTExYTUxM2IwOTY1EgsSBxDVl5X8qR0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MzIxOTU1MTU1OTAwNDY3MDcw&filename=&opi=89354086";
const imageUrl = "https://lh3.googleusercontent.com/aida/AEtjO1UZ_0iJ-2I5rcCoMzUwUHgTUUnYq_wO5dZTkr6-Z7f2iwmj9ywg_cWATW6VHSiUuTQ19I0U57973au-LjJtIbvBd1FmXXwWsbIy_KjG_z_yR7TwUsJ8gNz0iF0q8eHjgch1vexOxIou7aVIssC7-W88oXmiK3vNk-iKSBu47vhFCL6rmEV-VNvUxhxvdhtM4oajT8g4y2pwf-1lSg4jFfS6RDqjPwMokidUBas4M1tZ5GfAIl6ZTPB24n0";

async function download(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  console.log(`Downloaded ${dest} (${buffer.length} bytes)`);
}

async function main() {
  console.log('Downloading Stitch project screen assets...');
  await download(htmlUrl, 'stitch/404-assumption-not-found/screen.html');
  await download(imageUrl, 'stitch/404-assumption-not-found/screen.png');
  await download(imageUrl, 'public/stitch/404-assumption-not-found.png');
  console.log('Finished successfully!');
}

main().catch(err => {
  console.error('Download error:', err);
  process.exit(1);
});
