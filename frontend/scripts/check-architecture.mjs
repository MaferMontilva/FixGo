import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const modulesRoot = path.join(srcRoot, "modules");
const sharedRoot = path.join(srcRoot, "shared");

async function listTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listTypeScriptFiles(fullPath);
      }

      return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
    })
  );

  return files.flat();
}

function getImports(content) {
  const imports = [];
  const importPattern = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  let match;

  while ((match = importPattern.exec(content))) {
    imports.push(match[1]);
  }

  return imports;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveImport(filePath, specifier) {
  if (!specifier.startsWith(".")) return null;

  const resolved = path.resolve(path.dirname(filePath), specifier);
  const candidates = [
    `${resolved}.ts`,
    `${resolved}.tsx`,
    path.join(resolved, "index.ts"),
    path.join(resolved, "index.tsx"),
    resolved
  ];

  for (const candidate of candidates) {
    if (candidate.startsWith(srcRoot) && (await fileExists(candidate))) {
      return candidate;
    }
  }

  return resolved;
}

function moduleNameFromPath(filePath) {
  const relative = path.relative(modulesRoot, filePath);
  return relative.startsWith("..") ? null : relative.split(path.sep)[0];
}

function isModulePublicEntry(filePath) {
  return path.basename(filePath) === "index.ts";
}

const files = await listTypeScriptFiles(srcRoot);
const violations = [];

for (const filePath of files) {
  const content = await readFile(filePath, "utf8");
  const imports = getImports(content);

  for (const specifier of imports) {
    const resolved = await resolveImport(filePath, specifier);
    const normalizedSpecifier = specifier.replaceAll("\\", "/");

    if (filePath.startsWith(sharedRoot) && resolved?.startsWith(modulesRoot)) {
      violations.push(`${path.relative(root, filePath)} imports a module from shared: ${specifier}`);
    }

    if (filePath.startsWith(sharedRoot) && resolved?.startsWith(path.join(srcRoot, "app"))) {
      violations.push(`${path.relative(root, filePath)} imports app from shared: ${specifier}`);
    }

    if (/backend|@prisma|prisma\.service|fixgo\.db|schema\.sql|seed\.sql/.test(normalizedSpecifier)) {
      violations.push(`${path.relative(root, filePath)} imports backend infrastructure: ${specifier}`);
    }

    if (filePath.startsWith(modulesRoot) && resolved?.startsWith(modulesRoot)) {
      const sourceModule = moduleNameFromPath(filePath);
      const targetModule = moduleNameFromPath(resolved);

      if (sourceModule && targetModule && sourceModule !== targetModule && !isModulePublicEntry(resolved)) {
        violations.push(
          `${path.relative(root, filePath)} imports internal file from ${targetModule}: ${specifier}`
        );
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Frontend architecture check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Frontend architecture check passed.");
