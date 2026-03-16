import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const runnerPath = fileURLToPath(import.meta.url);
const prismaDir = path.dirname(runnerPath);
const repoRoot = path.resolve(prismaDir, "..");
const tsNodeBin = path.join(repoRoot, "node_modules", "ts-node", "dist", "bin.js");

const result = spawnSync(
  process.execPath,
  [
    tsNodeBin,
    "--skipProject",
    "--transpileOnly",
    "--compilerOptions",
    JSON.stringify({
      module: "CommonJS",
      moduleResolution: "node",
      esModuleInterop: true,
    }),
    path.join("prisma", "seed.ts"),
  ],
  {
    cwd: repoRoot,
    stdio: "inherit",
  }
);

process.exit(result.status ?? 1);
