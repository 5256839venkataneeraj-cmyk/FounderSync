import fs from 'fs';
import path from 'path';

const htmlUrl = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1Y2IxZWE2ZTEwYmQwNzNhZTExYTUxM2IwOTY1EgsSBxDVl5X8qR0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MzIxOTU1MTU1OTAwNDY3MDcw&filename=&opi=89354086";
const imageUrl = "https://lh3.googleusercontent.com/aida/AEtjO1Vpv-dKyqNh7Zc1UlfVjcrtLF7C7D-GqB6rZYuPNu4YkZj6JjwjOT7wm-fzZmIkdsL6dlI_SIn13g6WghXO0rLrqSiHDiPxWYMnXVMx0-7-WrzPorc2GrzqCg_xbSWCSXnDeqH4jHTcj7yePW_iuxXRp_qI7MLg4B0c-RituDsY8yXbnn3ZwWOM8BThw2MGlIvO-_csO4vZ7isbXfK1NhSrvMNUIlmi79iVP4R9trD-TrYgThAoiErChnc";

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
