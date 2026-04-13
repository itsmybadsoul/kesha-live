import { writeFileSync, existsSync } from 'fs';

// Cloudflare Pages _routes.json spec:
// https://developers.cloudflare.com/pages/functions/routing/#create-a-_routesjson-file
const routes = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/_next/image*",
    "/favicon.ico",
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
    "/*.css",
    "/*.js.map"
  ]
};

const outputPath = '.vercel/output/static/_routes.json';

if (!existsSync('.vercel/output/static')) {
  console.error('❌ .vercel/output/static does not exist – skipping _routes.json generation');
  process.exit(1);
}

writeFileSync(outputPath, JSON.stringify(routes, null, 2));
console.log('✓ _routes.json written to', outputPath);
console.log(JSON.stringify(routes, null, 2));
