import fs from 'fs';
import path from 'path';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getStaticExcludes(dir, basePath = '/') {
  let excludes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === '_next') {
         excludes.push('/_next/*');
      } else {
         excludes = excludes.concat(getStaticExcludes(path.join(dir, entry.name), `${basePath}${entry.name}/`));
      }
    } else {
      excludes.push(`${basePath}${entry.name}`);
    }
  }
  return excludes;
}

try {
  console.log("Starting static asset flattening...");
  const baseDir = '.open-next';
  const assetsDir = path.join(baseDir, 'assets');

  // 1. Copy assets to root
  if (fs.existsSync(assetsDir)) {
    copyDirRecursive(assetsDir, baseDir);
    console.log("Flattened assets successfully.");
  } else {
    console.log("No assets directory to flatten.");
  }

  // 2. Generate _routes.json
  const excludes = ['/_next/*']; // Always explicitly exclude _next
  
  // Find all top-level public files
  if (fs.existsSync(assetsDir)) {
    const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        const routePath = `/${entry.name}`;
        if (!excludes.includes(routePath)) {
            excludes.push(routePath);
        }
      }
    }
  }

  // Ensure no duplicates and under 100 limit
  const uniqueExcludes = [...new Set(excludes)].slice(0, 99);

  const routesObj = {
    version: 1,
    include: ["/*"],
    exclude: uniqueExcludes
  };

  fs.writeFileSync(path.join(baseDir, '_routes.json'), JSON.stringify(routesObj, null, 2));
  console.log(`Generated _routes.json with ${uniqueExcludes.length} exclusions.`);

  // 3. Move worker execution file
  const workerSrc = path.join(baseDir, 'worker.js');
  const workerDest = path.join(baseDir, '_worker.js');
  if (fs.existsSync(workerSrc)) {
    fs.renameSync(workerSrc, workerDest);
    console.log("Renamed worker.js to _worker.js");
  }

  console.log("Build optimization complete.");
} catch (error) {
  console.error("Failed to build Cloudflare Pages configuration:", error);
  process.exit(1);
}
