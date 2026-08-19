const RETRY_DELAYS_MS = [1_000, 3_000, 8_000];

export function repositorySlug(repository) {
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/.exec(repository);
  if (!match) throw new Error(`invalid GitHub repository: ${repository}`);
  return match[1];
}

function apiHeaders(token, userAgent) {
  return {
    accept: "application/vnd.github+json",
    "user-agent": userAgent,
    ...(token ? { authorization: `Bearer ${token}` } : {})
  };
}

async function githubJson(path, { token, userAgent, fetcher = fetch }) {
  const url = `https://api.github.com${path}`;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    let response;
    try {
      response = await fetcher(url, {
        headers: apiHeaders(token, userAgent),
        signal: AbortSignal.timeout(15_000)
      });
    } catch (error) {
      if (attempt === RETRY_DELAYS_MS.length) {
        throw new Error(`${url} request failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      continue;
    }
    if (response.ok) return response.json();
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === RETRY_DELAYS_MS.length) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }
}

function contentPath(subpath) {
  const path = subpath ? `${subpath}/package.json` : "package.json";
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function latestGitHubSource(source, options = {}) {
  const slug = repositorySlug(source.repository);
  const requestOptions = {
    token: options.token,
    userAgent: options.userAgent ?? "awesome-dsh-themes",
    fetcher: options.fetcher
  };
  const repository = await githubJson(`/repos/${slug}`, requestOptions);
  if (typeof repository.default_branch !== "string" || repository.default_branch === "") {
    throw new Error(`${slug} has no default branch`);
  }
  const head = await githubJson(`/repos/${slug}/commits/${encodeURIComponent(repository.default_branch)}`, requestOptions);
  if (typeof head.sha !== "string" || !/^[0-9a-f]{40}$/.test(head.sha)) {
    throw new Error(`${slug} returned an invalid default-branch commit`);
  }
  const content = await githubJson(`/repos/${slug}/contents/${contentPath(source.subpath)}?ref=${head.sha}`, requestOptions);
  if (content.encoding !== "base64" || typeof content.content !== "string") {
    throw new Error(`${slug} package.json is not a GitHub file`);
  }
  let manifest;
  try {
    manifest = JSON.parse(Buffer.from(content.content.replace(/\s/g, ""), "base64").toString("utf8"));
  } catch {
    throw new Error(`${slug} package.json is not valid JSON`);
  }
  const updatedAt = head.commit?.committer?.date ?? head.commit?.author?.date;
  if (typeof updatedAt !== "string" || !Number.isFinite(Date.parse(updatedAt))) {
    throw new Error(`${slug} returned an invalid commit date`);
  }
  return { commit: head.sha, updatedAt, manifest, repository };
}
