import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const modulesRoot = path.join(root, "src", "modules");
const checkedModules = ["auth", "users", "clients", "categories", "professionals", "service-requests"];

const rules = [
  {
    layer: "domain",
    forbidden: [
      { label: "@nestjs", pattern: /from\s+["']@nestjs\// },
      { label: "@prisma", pattern: /from\s+["']@prisma\// },
      { label: "infrastructure", pattern: /from\s+["'][^"']*infrastructure/ },
      { label: "presentation", pattern: /from\s+["'][^"']*presentation/ },
      { label: "application", pattern: /from\s+["'][^"']*application/ },
      { label: "PrismaService", pattern: /prisma\.service/ }
    ]
  },
  {
    layer: "application",
    forbidden: [
      { label: "infrastructure/prisma", pattern: /from\s+["'][^"']*infrastructure\/prisma/ },
      { label: "presentation", pattern: /from\s+["'][^"']*presentation/ },
      { label: "PrismaService", pattern: /prisma\.service/ },
      { label: "@prisma/client", pattern: /from\s+["']@prisma\/client/ }
    ]
  },
  {
    layer: "presentation",
    forbidden: [
      { label: "PrismaService", pattern: /prisma\.service/ },
      { label: "@prisma/client", pattern: /from\s+["']@prisma\/client/ },
      { label: "SQLite files", pattern: /fixgo\.db|schema\.sql|seed\.sql/ },
      { label: "Prisma repositories", pattern: /prisma-[a-z-]+\.repository/ }
    ]
  }
];

async function listTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listTypeScriptFiles(fullPath);
      }

      return entry.isFile() && entry.name.endsWith(".ts") ? [fullPath] : [];
    })
  );

  return files.flat();
}

const violations = [];

for (const moduleName of checkedModules) {
  for (const rule of rules) {
    const layerPath = path.join(modulesRoot, moduleName, rule.layer);

    let files = [];
    try {
      files = await listTypeScriptFiles(layerPath);
    } catch {
      continue;
    }

    for (const filePath of files) {
      const content = await readFile(filePath, "utf8");

      for (const forbidden of rule.forbidden) {
        if (forbidden.pattern.test(content)) {
          violations.push({
            module: moduleName,
            layer: rule.layer,
            file: path.relative(root, filePath),
            violation: forbidden.label
          });
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture check failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.module}/${violation.layer}: ${violation.file} imports ${violation.violation}`
    );
  }
  process.exit(1);
}

console.log("Architecture check passed.");
