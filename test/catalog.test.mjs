import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { githubRepositoryCard, isGitHubRepositoryCard, renderRepositoryCard, themeScreenshots } from "../scripts/theme-screenshots.mjs";

const source = {
  repository: "https://github.com/example/dsh-theme",
  commit: "0123456789abcdef0123456789abcdef01234567"
};

test("uses the GitHub repository card when screenshots are missing", () => {
  const card = "https://opengraph.githubassets.com/0123456789abcdef0123456789abcdef01234567/example/dsh-theme";
  assert.equal(githubRepositoryCard(source), card);
  assert.equal(isGitHubRepositoryCard(card, source), true);
  assert.equal(isGitHubRepositoryCard(card, { ...source, repository: "https://github.com/example/other" }), false);
  assert.deepEqual(themeScreenshots({ source }), [card]);
  assert.deepEqual(themeScreenshots({ source, screenshots: [] }), [card]);
});

test("keeps submitted screenshots", () => {
  assert.deepEqual(themeScreenshots({ source, screenshots: ["preview.png"] }), ["preview.png"]);
});

test("renders a decodable local repository card", async () => {
  const card = renderRepositoryCard(source, {
    full_name: "example/dsh-theme",
    name: "dsh-theme",
    description: "A DSH theme",
    stargazers_count: 12,
    forks_count: 3,
    open_issues_count: 1
  });
  const metadata = await sharp(card).metadata();
  assert.equal(metadata.format, "svg");
  assert.equal(metadata.width, 960);
  assert.equal(metadata.height, 540);
});

test("catalog entries pass the offline validator", () => {
  const output = execFileSync(process.execPath, ["scripts/build-catalog.mjs", "--check", "--offline"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });
  if (!output.includes("validated")) throw new Error(`unexpected validator output: ${output}`);
});
