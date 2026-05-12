const fs = require('fs');
const path = require('path');

// Patterns to fix:
// 1. "hover:text-white dark:hover:text-white" in link/non-button contexts → "hover:text-slate-900 dark:hover:text-white"
// 2. Sign-in button text on colored buttons: keep "text-white"
// 3. Remove bg-white/[0.04] left over only where light bg should show

const FILES_SKIP = ['Navbar.tsx']; // already fixed

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if ((fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      const basename = path.basename(fullPath);
      if (FILES_SKIP.includes(basename)) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // Fix: plain anchor/breadcrumb links with hover:text-white that aren't on a button
      // These show up as e.g. <a ... hover:text-white dark:hover:text-white ...>
      // We want them to become hover:text-slate-900 dark:hover:text-white
      // BUT: skip when preceded by "hover:bg-" (i.e., it IS a button that fills with color)
      
      // Strategy: replace "hover:text-white dark:hover:text-white" only when NOT preceded by hover:bg- on same className
      // Simpler: just replace all of them — on buttons with colored fill the fill color handles visibility,
      // and on pure text links this makes them visible in light mode.
      content = content.replace(/hover:text-white\s+dark:hover:text-white/g, 'hover:text-slate-900 dark:hover:text-white');

      // Fix remaining "bg-white/\[0.04\]" (very low opacity white, invisible in light mode)
      content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-slate-100/80 dark:bg-white/[0.04]');

      // Fix "border-white/5" (invisible in light mode)  
      content = content.replace(/border-white\/5(?!\d)/g, 'border-slate-200 dark:border-white/5');
      content = content.replace(/border-white\/10(?!\d)/g, 'border-slate-300 dark:border-white/10');

      // Fix text on buttons that hover-fill with color — restore them to white for readability
      // e.g. "hover:bg-emerald-500 ... hover:text-slate-900 dark:hover:text-white" → keep as-is (already handled above)
      // The "hover:text-slate-900" on a green filled button is actually fine: dark text on bright green.

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', path.relative(process.cwd(), fullPath));
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('\nFinal light-mode pass complete!');
