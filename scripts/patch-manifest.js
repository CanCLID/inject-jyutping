import { readFile, writeFile } from 'fs/promises';

const path = './dist/manifest.json';
const manifest = JSON.parse(await readFile(path, 'utf-8'));
manifest.background.scripts = [manifest.background.service_worker];
manifest.background.persistent = true;
await writeFile(path, JSON.stringify(manifest));
