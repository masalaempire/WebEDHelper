import { readdir, readFile } from 'node:fs/promises';
const repository = process.env.GITHUB_REPOSITORY;
const sourceSHA = process.env.SOURCE_SHA;
const branch = 'qa/v0.1-preview';
async function api(path, method = 'GET', body) {
  const response = await fetch('https://api.github.com/repos/' + repository + '/' + path, {
    method, headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(path + ': ' + response.status + ' ' + await response.text());
  return response.json();
}
let parent;
try { parent = (await api('git/ref/heads/' + branch)).object.sha; }
catch (error) {
  if (!String(error).includes(': 404 ')) throw error;
  await api('git/refs', 'POST', { ref: 'refs/heads/' + branch, sha: sourceSHA }); parent = sourceSHA;
}
const sourceCommit = await api('git/commits/' + sourceSHA);
const tree = [];
for (const filename of (await readdir('reports/screenshots')).filter(name => name.endsWith('.png')).sort()) {
  const blob = await api('git/blobs', 'POST', { content: (await readFile('reports/screenshots/' + filename)).toString('base64'), encoding: 'base64' });
  tree.push({ path: 'qa/screenshots/' + filename, mode: '100644', type: 'blob', sha: blob.sha });
}
tree.push({ path: 'qa/review.json', mode: '100644', type: 'blob', content: JSON.stringify({ sourceSHA, runURL: 'https://github.com/' + repository + '/actions/runs/' + process.env.GITHUB_RUN_ID, generatedAt: new Date().toISOString(), note: 'Screenshots use a test collection; the app starts with an empty saved collection.' }, null, 2) });
const builtTree = await api('git/trees', 'POST', { base_tree: sourceCommit.tree.sha, tree });
const commit = await api('git/commits', 'POST', { message: 'Review screenshots for ' + sourceSHA.slice(0, 7), tree: builtTree.sha, parents: [parent] });
await api('git/refs/heads/' + branch, 'PATCH', { sha: commit.sha, force: false });
console.log('Remote screenshots: https://github.com/' + repository + '/tree/' + branch + '/qa/screenshots');
