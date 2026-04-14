import fs from 'fs';
import path from 'path';

function getStaticFiles(dir, basePath = '/') {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name !== '_next') {
         files = files.concat(getStaticFiles(path.join(dir, entry.name), `${basePath}${entry.name}/`));
      }
    } else {
      files.push(`${basePath}${entry.name}`);
    }
  }
  return files;
}

try {
  console.log("Starting OpenNext Cloudflare Pages patching...");
  const baseDir = '.open-next';
  const assetsDir = path.join(baseDir, 'assets');
  let staticFiles = [];

  if (fs.existsSync(assetsDir)) {
    staticFiles = getStaticFiles(assetsDir);
  }

  // Rename worker.js to _worker.js
  const workerSrc = path.join(baseDir, 'worker.js');
  const workerDest = path.join(baseDir, '_worker.js');
  
  if (fs.existsSync(workerSrc)) {
    let workerContent = fs.readFileSync(workerSrc, 'utf8');
    
    // Convert array to string for code injection
    const staticFilesJson = JSON.stringify(staticFiles);
    
    // Inject the CF Pages ASSETS interceptor right after URL extraction
    const injection = `
            // --- INJECTED BY CLOUDFLARE PAGES ROUTER FIX ---
            const staticAssets = ${staticFilesJson};
            if (url.pathname.startsWith("/_next/") || staticAssets.includes(url.pathname)) {
                const assetUrl = new URL("/assets" + url.pathname, request.url);
                const assetReq = new Request(assetUrl, request);
                const assetRes = await env.ASSETS.fetch(assetReq);
                if (assetRes.ok) return assetRes;
                // If ASSETS router fails to find it (404), fall through to Next.js
            }
            // -----------------------------------------------
    `;
    
    workerContent = workerContent.replace(
      'const url = new URL(request.url);',
      'const url = new URL(request.url);\n' + injection
    );
    
    // In Cloudflare Pages, we don't use _routes.json because it's buggy with Next.js specific pathing and underscores.
    // Instead we delete it if it exists so 100% of traffic routes through _worker.js which explicitly proxies to the /assets folder.
    const routesFile = path.join(baseDir, '_routes.json');
    if (fs.existsSync(routesFile)) {
        fs.unlinkSync(routesFile);
    }
    
    // VERY IMPORTANT: Cloudflare Pages ignores folders starting with '_' during upload.
    // Creating .nojekyll bypasses this hidden-folder behavior and ensures assets/_next gets uploaded!
    fs.writeFileSync(path.join(baseDir, '.nojekyll'), '');
    
    // Write out the modified worker
    fs.writeFileSync(workerDest, workerContent);
    // Delete the original worker.js just to be clean
    fs.unlinkSync(workerSrc);
    
    console.log(`Successfully patched _worker.js to intelligently proxy ${staticFiles.length} top-level files and /_next/* to the env.ASSETS bucket.`);
  } else {
    console.error("worker.js not found in .open-next!");
  }

  console.log("Pages optimization complete.");
} catch (error) {
  console.error("Failed to patch Cloudflare Pages configuration:", error);
  process.exit(1);
}
