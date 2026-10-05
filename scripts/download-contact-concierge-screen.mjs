import fs from 'fs';
import path from 'path';

const htmlUrl = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1Y2M0OTNhZTMzYzEwMmE5OWZlOWI4MWE2NWI0EgsSBxDVl5X8qR0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MzIxOTU1MTU1OTAwNDY3MDcw&filename=&opi=89354086";
const imageUrl = "https://lh3.googleusercontent.com/aida/AEtjO1WyDH6w8uXrYAyZOVw4jtUlycqphVPKaElmwpsNKklwKTjTzK-TyPoyV3uTuAdxpEH6iVIWTsAljsZktrMRwhJsdWu9dZaZlPO7jAy5VNkQZ6LBwLQcTt8oU81EUUwY4EXH_BI5dERqPw2tg-pLsnDijfYJCpd0eOYvE9n14hNQJALuVFszGINlOx2XNAHG4rOIx1OtkBcaaLKP6XfOPelTcuqyGGNyJZArd11UPDqKOEr6nW7sMfN1spk";

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
  console.log('Downloading Contact Us & Executive Concierge screen assets...');
  await download(htmlUrl, 'stitch/contact-us-concierge/screen.html');
  await download(imageUrl, 'stitch/contact-us-concierge/screen.png');
  await download(imageUrl, 'public/stitch/contact-us-concierge.png');
  console.log('Finished successfully!');
}

main().catch(err => {
  console.error('Download error:', err);
  process.exit(1);
});
