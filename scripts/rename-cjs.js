import { renameSync, readdirSync } from 'fs';
import { join } from 'path';

const distElectronDir = join(process.cwd(), 'dist-electron');

try {
  const files = readdirSync(distElectronDir);
  
  for (const file of files) {
    if (file.endsWith('.js')) {
      const oldPath = join(distElectronDir, file);
      const newPath = join(distElectronDir, file.replace(/\.js$/, '.cjs'));
      renameSync(oldPath, newPath);
      console.log(`Renamed ${file} to ${file.replace(/\.js$/, '.cjs')}`);
    }
  }
  
  console.log('Successfully renamed all .js files to .cjs in dist-electron/');
} catch (error) {
  console.error('Error renaming files:', error);
  process.exit(1);
}
