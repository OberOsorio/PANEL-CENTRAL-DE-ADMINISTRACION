import { watch } from 'fs';
import { exec } from 'child_process';
import { join, sep } from 'path';

// Project directory and settings
const watchDir = process.cwd();
const DEBOUNCE_MS = 5000; // Wait 5 seconds of inactivity before pushing changes
let debounceTimer = null;
let changedFiles = new Set();

// Directories and file patterns to ignore
const ignoredDirs = ['.git', 'node_modules', 'dist', 'build', '.insforge', 'bun.lock', '.agent', '.agents', '.claude', '.roo'];

function shouldIgnore(filename) {
  if (!filename) return true;
  
  // Normalize path separators to forward slash for easy comparison
  const normalized = filename.replace(/\\/g, '/');
  
  // Ignore specific directories
  const pathParts = normalized.split('/');
  const hasIgnoredDir = pathParts.some(part => ignoredDirs.includes(part));
  if (hasIgnoredDir) return true;
  
  // Ignore environment files
  if (pathParts.some(part => part.startsWith('.env'))) return true;
  
  // Ignore the watcher file itself to prevent any potential loops
  if (normalized === 'watch-push.js') return true;

  return false;
}

function runGitPush() {
  const filesList = Array.from(changedFiles);
  console.log(`\n[Auto-Push] ${new Date().toLocaleTimeString()} - Cambios detectados en: ${filesList.join(', ')}`);
  console.log('[Auto-Push] Iniciando proceso de subida a GitHub...');
  
  changedFiles.clear();

  exec('git add -A', (err) => {
    if (err) {
      console.error('[Auto-Push] Error al hacer git add:', err.message);
      return;
    }

    exec('git commit -m "Auto-commit: cambios guardados"', (err, stdout, stderr) => {
      // Check if there is nothing to commit
      if (err) {
        if (err.message.includes('nothing to commit') || stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
          console.log('[Auto-Push] No hay cambios reales que guardar (limpio).');
          return;
        }
        console.error('[Auto-Push] Error al hacer git commit:', err.message);
        return;
      }

      console.log('[Auto-Push] Commit creado con éxito. Subiendo cambios a GitHub...');
      exec('git push origin main', (err, stdout, stderr) => {
        if (err) {
          console.error('[Auto-Push] Error al hacer git push:', err.message);
          console.error(stderr);
          return;
        }
        console.log('[Auto-Push] ¡Cambios subidos exitosamente a GitHub!');
      });
    });
  });
}

console.log(`================================================================`);
console.log(`[Auto-Push] Iniciando monitoreo de archivos en: ${watchDir}`);
console.log(`[Auto-Push] Presiona Ctrl+C para detener el monitoreo.`);
console.log(`================================================================\n`);

watch(watchDir, { recursive: true }, (eventType, filename) => {
  if (shouldIgnore(filename)) return;

  changedFiles.add(filename);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    runGitPush();
  }, DEBOUNCE_MS);
});
