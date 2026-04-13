import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// This script ensures that static assets (CSS, JS, Images, Fonts) 
// bypass the Cloudflare Edge Worker to prevent 500 errors.

const routes = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/_next/image*",
    "/favicon.ico",
    "/trader*.png",
    "/file.svg",
    "/globe.svg",
    "/next.svg",
    "/vercel.svg",
    "/window.svg",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.webp",
    "/*.gif",
    "/*.svg",
    "/*.ico",
    "/*.woff",
    "/*.woff2",
    "/*.ttf",
    "/*.otf",
    "/*.eot",
    "/*.css"
  ]
};

// We target .vercel/output/static as the root of the deployment
const outputDir = join(process.cwd(), '.vercel', 'output', 'static');

if (!existsSync(outputDir)) {
    console.log('⚠️ Directory .vercel/output/static not found, creating it...');
    mkdirSync(outputDir, { recursive: true });
}

const outputPath = join(outputDir, '_routes.json');

try {
    writeFileSync(outputPath, JSON.stringify(routes, null, 2));
    console.log('✅ Successfully generated _routes.json at ' + outputPath);
    console.log('Configuration summary: Excluding ' + routes.exclude.length + ' static patterns from the Worker.');
} catch (error) {
    console.error('❌ Failed to write _routes.json:', error);
    process.exit(1);
}
