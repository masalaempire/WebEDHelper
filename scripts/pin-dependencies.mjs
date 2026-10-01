import { readFile, writeFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
for (const section of ['dependencies', 'devDependencies']) {
  await Promise.all(Object.keys(manifest[section]).map(async (name) => {
    const response = await fetch('https://registry.npmjs.org/' + encodeURIComponent(name) + '/latest');
    if (!response.ok) throw new Error('Registry request failed: ' + name + ' ' + response.status);
    const metadata = await response.json();
    manifest[section][name] = metadata.version;
    console.log(name + ': ' + metadata.version);
  }));
}
await writeFile('package.json', JSON.stringify(manifest, null, 2) + '\n');
