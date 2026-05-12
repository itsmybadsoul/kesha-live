const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Core Backgrounds
      content = content.replace(/bg-\[#0A0A0B\]/g, 'bg-slate-50 dark:bg-[#0A0A0B]');
      content = content.replace(/bg-\[#080810\]/g, 'bg-slate-50 dark:bg-[#080810]');
      content = content.replace(/bg-\[#0f0f1a\]/g, 'bg-white dark:bg-[#0f0f1a]');
      content = content.replace(/bg-\[#12141d\]/g, 'bg-white dark:bg-[#12141d]');
      
      // Panel Backgrounds
      content = content.replace(/bg-gray-900\/50/g, 'bg-white/80 dark:bg-gray-900/50');
      content = content.replace(/bg-gray-900\/80/g, 'bg-white dark:bg-gray-900/80');
      content = content.replace(/bg-gray-900\/60/g, 'bg-white/90 dark:bg-gray-900/60');
      content = content.replace(/bg-gray-900/g, 'bg-white dark:bg-gray-900');
      content = content.replace(/bg-gray-800\/40/g, 'bg-white/60 dark:bg-gray-800/40');
      content = content.replace(/bg-gray-800\/50/g, 'bg-white/70 dark:bg-gray-800/50');
      content = content.replace(/bg-gray-800/g, 'bg-slate-100 dark:bg-gray-800');
      
      // Text Colors
      content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');
      content = content.replace(/text-gray-400/g, 'text-slate-500 dark:text-gray-400');
      content = content.replace(/text-gray-300/g, 'text-slate-600 dark:text-gray-300');
      content = content.replace(/text-gray-500/g, 'text-slate-400 dark:text-gray-500');
      
      // Borders
      content = content.replace(/border-gray-800/g, 'border-slate-200 dark:border-gray-800');
      content = content.replace(/border-gray-700/g, 'border-slate-300 dark:border-gray-700');
      content = content.replace(/border-white\/5/g, 'border-slate-200 dark:border-white/5');
      content = content.replace(/border-white\/10/g, 'border-slate-300 dark:border-white/10');
      
      // Revert unwanted replacements inside strictly dark components (like buttons)
      content = content.replace(/bg-indigo-600 text-slate-900 dark:text-white/g, 'bg-indigo-600 text-white');
      content = content.replace(/bg-indigo-500 text-slate-900 dark:text-white/g, 'bg-indigo-500 text-white');
      content = content.replace(/bg-emerald-500 text-slate-900 dark:text-white/g, 'bg-emerald-500 text-white');
      content = content.replace(/bg-red-500 text-slate-900 dark:text-white/g, 'bg-red-500 text-white');
      content = content.replace(/bg-blue-600 text-slate-900 dark:text-white/g, 'bg-blue-600 text-white');
      content = content.replace(/from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-slate-900 dark:text-white/g, 'from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white');
      content = content.replace(/from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-900 dark:text-white/g, 'from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white');
      content = content.replace(/from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-slate-900 dark:text-white/g, 'from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Refactor complete');
