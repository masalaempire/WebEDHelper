import { readFile, writeFile, mkdir } from 'node:fs/promises';
const resources = JSON.parse(await readFile('src/data/resources.json', 'utf8'));
const tasks = JSON.parse(await readFile('src/data/tasks.json', 'utf8'));
const urls = [...new Set([...resources.map(r => r.url), ...tasks.map(t => t.url)])];
const report = [];
for (let offset = 0; offset < urls.length; offset += 5) {
  const batch = await Promise.all(urls.slice(offset, offset + 5).map(async url => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'MiniEliteHelper-LinkReview/0.1 (+https://github.com/masalaempire/WebEDHelper)' } });
      await response.body?.cancel();
      return { url, status: response.status, finalURL: response.url, result: response.ok ? 'reachable' : [403, 429].includes(response.status) ? 'manual-review' : 'needs-review' };
    } catch (error) { return { url, result: 'needs-review', error: String(error) }; }
  }));
  report.push(...batch);
}
await mkdir('reports', { recursive: true });
await writeFile('reports/link-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), links: report }, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log('Reachable: ' + report.filter(r => r.result === 'reachable').length + '/' + report.length + '. Other results require manual review; access blocks do not establish that a service is offline.');
