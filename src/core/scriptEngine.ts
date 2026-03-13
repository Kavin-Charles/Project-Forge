import { exec } from 'child_process';
import { promisify } from 'util';
import * as logger from '../utils/logger';
import { ResolvedTemplate } from './generator';

const execAsync = promisify(exec);

export async function executePostInstallScripts(templates: ResolvedTemplate[], projectRoot: string): Promise<void> {
  const scriptsToRun: { name: string; script: string }[] = [];

  // Collect all postInstall scripts from the resolved templates
  for (const t of templates) {
    if (t.manifest.scripts?.postInstall) {
      scriptsToRun.push({
        name: t.manifest.name,
        script: t.manifest.scripts.postInstall
      });
    }
  }

  if (scriptsToRun.length === 0) return;

  logger.info('\nExecuting post-generation scripts...');

  for (const item of scriptsToRun) {
    const spinner = logger.spinner(`Running script for ${item.name}: ${item.script}`);
    try {
      // Execute within the newly generated project directory
      await execAsync(item.script, { cwd: projectRoot });
      spinner.succeed(`Successfully configured ${item.name}`);
    } catch (err: any) {
      spinner.warn(`Script for ${item.name} completed with warnings: ${err.message}`);
    }
  }
}
