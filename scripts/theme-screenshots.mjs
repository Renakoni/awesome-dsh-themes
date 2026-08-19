const GITHUB_REPOSITORY = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/;
const COMMIT_SHA = /^[0-9a-f]{40}$/;

export function githubRepositoryCard(source) {
  const match = GITHUB_REPOSITORY.exec(source?.repository ?? "");
  if (!match) throw new Error(`invalid GitHub repository: ${String(source?.repository)}`);
  if (!COMMIT_SHA.test(source?.commit ?? "")) throw new Error(`invalid source commit: ${String(source?.commit)}`);
  return `https://opengraph.githubassets.com/${source.commit}/${match[1]}`;
}

export function themeScreenshots(entry) {
  if (entry.screenshots !== undefined && !Array.isArray(entry.screenshots)) {
    throw new Error("screenshots must be an array");
  }
  return entry.screenshots?.length > 0
    ? [...entry.screenshots]
    : [githubRepositoryCard(entry.source)];
}

export function isGitHubRepositoryCard(url, source) {
  const match = GITHUB_REPOSITORY.exec(source?.repository ?? "");
  if (!match || typeof url !== "string") return false;
  const card = /^https:\/\/opengraph\.githubassets\.com\/[^/]+\/([^/]+\/[^/]+)\/?$/.exec(url);
  return card?.[1].toLowerCase() === match[1].toLowerCase();
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function shorten(value, length) {
  const text = String(value ?? "").trim();
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

export function renderRepositoryCard(source, repository = {}) {
  const slug = source.repository.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
  const fullName = shorten(repository.full_name ?? slug, 64);
  const name = shorten(repository.name ?? fullName.split("/").at(-1), 30);
  const description = shorten(repository.description ?? "DeepSeek Harness theme", 120);
  const descriptionLines = [description.slice(0, 64), description.slice(64)];
  const stars = Number.isInteger(repository.stargazers_count) ? repository.stargazers_count.toLocaleString("en-US") : "-";
  const forks = Number.isInteger(repository.forks_count) ? repository.forks_count.toLocaleString("en-US") : "-";
  const issues = Number.isInteger(repository.open_issues_count) ? repository.open_issues_count.toLocaleString("en-US") : "-";
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    <rect width="960" height="540" fill="#ffffff"/>
    <rect x="1" y="1" width="958" height="538" fill="none" stroke="#d0d7de" stroke-width="2"/>
    <text x="56" y="70" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#57606a">GITHUB REPOSITORY</text>
    <text x="56" y="145" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#24292f">${escapeXml(name)}</text>
    <text x="56" y="190" font-family="Arial, sans-serif" font-size="22" fill="#57606a">${escapeXml(fullName)}</text>
    <text x="56" y="260" font-family="Arial, sans-serif" font-size="24" fill="#57606a">${escapeXml(descriptionLines[0])}</text>
    <text x="56" y="298" font-family="Arial, sans-serif" font-size="24" fill="#57606a">${escapeXml(descriptionLines[1])}</text>
    <line x1="56" y1="365" x2="904" y2="365" stroke="#d8dee4"/>
    <text x="56" y="425" font-family="Arial, sans-serif" font-size="20" fill="#57606a">Stars</text>
    <text x="56" y="462" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#24292f">${stars}</text>
    <text x="230" y="425" font-family="Arial, sans-serif" font-size="20" fill="#57606a">Forks</text>
    <text x="230" y="462" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#24292f">${forks}</text>
    <text x="404" y="425" font-family="Arial, sans-serif" font-size="20" fill="#57606a">Issues</text>
    <text x="404" y="462" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#24292f">${issues}</text>
    <rect x="0" y="516" width="720" height="24" fill="#f2cc60"/>
    <rect x="720" y="516" width="240" height="24" fill="#2f81f7"/>
  </svg>`);
}
