import * as fs from 'fs-extra';
import * as path from 'path';
import * as logger from '../utils/logger';

export async function createBackup(projectRoot: string): Promise<string> {
  const forgeDir = path.join(projectRoot, '.forge');
  const backupBaseDir = path.join(forgeDir, 'backups');
  
  await fs.ensureDir(backupBaseDir);
  
  // Format: YYYY-MM-DD-HH-MM-SS
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupBaseDir, timestamp);

  try {
    logger.info(`Creating pre-migration backup at .forge/backups/${timestamp}...`);
    
    const items = await fs.readdir(projectRoot);
    const ignoreList = ['node_modules', 'dist', '.forge', '.git'];

    for (const item of items) {
      if (ignoreList.includes(item)) continue;
      
      const srcPath = path.join(projectRoot, item);
      const destPath = path.join(backupPath, item);
      await fs.copy(srcPath, destPath, { overwrite: true });
    }
    
    logger.success('Backup completed successfully.');
    return backupPath;
  } catch (error: any) {
    logger.error(`Failed to create backup: ${error.message}`);
    throw error;
  }
}
