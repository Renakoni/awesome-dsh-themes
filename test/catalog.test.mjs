import { execFileSync } from "node:child_process";
import test from "node:test";

test("catalog entries pass the offline validator", () => {
  const output = execFileSync(process.execPath, ["scripts/build-catalog.mjs", "--check", "--offline"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });
  if (!output.includes("validated")) throw new Error(`unexpected validator output: ${output}`);
});
