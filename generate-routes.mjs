import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// This script ensures that static assets (CSS, JS, Images, Fonts) 
// bypass the Cloudflare Edge Worker to prevent 500 errors.
// It writes to multiple potential deployment roots to ensure Cloudflare picks it up.

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

const outputBase = join(process.cwd(), '.vercel', 'output');
const paths = [
    join(outputBase, '_routes.json'),
    join(outputBase, 'static', '_routes.json')
];

// Ensure directories exist
if (!existsSync(outputBase)) mkdirSync(outputBase, { recursive: true });
if (!existsSync(join(outputBase, 'static'))) mkdirSync(join(outputBase, 'static'), { recursive: true });

paths.forEach(outputPath => {
    try {
        writeFileSync(outputPath, JSON.stringify(routes, null, 2));
        console.log('✅ Successfully generated _routes.json at ' + outputPath);
    } catch (error) {
        console.error('❌ Failed to write _routes.json at ' + outputPath + ':', error);
    }
});

console.log('Configuration summary: Excluding ' + routes.exclude.length + ' static patterns from the Worker.');
