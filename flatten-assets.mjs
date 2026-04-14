import fs from 'fs';
import path from 'path';

// Helper to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log("Starting OpenNext Cloudflare Pages optimization...");
  const baseDir = '.open-next';
  const assetsDir = path.join(baseDir, 'assets');

  // 1. Force Cloudflare Pages not to drop hidden directories like _next
  const nojekyllPath = path.join(baseDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log("Created .nojekyll to preserve _next directory during upload.");

  // 2. Flatten all assets to the root of .open-next
  // This is required because OpenNext outputs them to `.open-next/assets/`,
  // but the browser will request them from `/` (e.g. `/_next/...` or `/favicon.ico`).
  if (fs.existsSync(assetsDir)) {
      console.log(`Copying assets from ${assetsDir} to ${baseDir}...`);
      const entries = fs.readdirSync(assetsDir);
      for (const entry of entries) {
          copyRecursiveSync(path.join(assetsDir, entry), path.join(baseDir, entry));
      }
      console.log("Asset copy complete.");
  } else {
      console.warn("No assets directory found in .open-next!");
  }

  // 3. Rename OpenNext generated worker.js to _worker.js which Pages requires
  const workerSrc = path.join(baseDir, 'worker.js');
  const workerDest = path.join(baseDir, '_worker.js');
  if (fs.existsSync(workerSrc)) {
      fs.renameSync(workerSrc, workerDest);
      console.log("Renamed worker.js to _worker.js");
  }

  // 4. Generate _routes.json
  // Because OpenNext does not natively generate a _routes.json for Pages, every request routes to the worker by default.
  // The worker then falls back to Next.js which returns 404 for static files.
  // We must generate _routes.json to tell Cloudflare Edge to natively serve our duplicated root assets and bypass the worker entirely.
  const excludePaths = [];
  if (fs.existsSync(assetsDir)) {
      const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
      for (const entry of entries) {
          if (entry.isDirectory()) {
              excludePaths.push(`/${entry.name}/*`);
          } else {
              excludePaths.push(`/${entry.name}`);
          }
      }
  }

  const routesFile = path.join(baseDir, '_routes.json');
  const routesData = {
      version: 1,
      include: ["/*"],
      exclude: excludePaths
  };
  fs.writeFileSync(routesFile, JSON.stringify(routesData, null, 2));
  console.log(`Generated _routes.json with ${excludePaths.length} static edge exclusions.`);

  console.log("Pages optimization complete.");
} catch (error) {
  console.error("Critical failure during Pages optimization:", error);
  process.exit(1);
}
