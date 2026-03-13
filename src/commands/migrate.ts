import { Command } from 'commander';
import inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ForgeConfig } from '../types/ForgeConfig';
import { ProjectLock } from '../types/ProjectLock';
import { resolveTemplates, generateProject } from '../core/generator';
import { computeTemplateDiff } from '../core/diffEngine';
import { applyRemoves } from '../core/mergeEngine';
import { createBackup } from '../core/backupEngine';
import * as logger from '../utils/logger';

export function registerMigrateCommand(program: Command): void {
  program
    .command('migrate <component> <target>')
    .description('Safely migrate a portion of your project stack (e.g. "database postgres")')
    .action(async (component: string, target: string) => {
      logger.header('forge-gen — Stack Evolution');
      let spinnerInst: any;

      try {
        const projectRoot = process.cwd();
        const configPath = path.join(projectRoot, 'forge.config.json');
        const lockPath = path.join(projectRoot, '.forge', 'project.lock');

        if (!fs.existsSync(configPath) || !fs.existsSync(lockPath)) {
          logger.error('Not inside a valid forge-gen project. Missing forge.config.json or .forge/project.lock');
          process.exit(1);
        }

        const config: ForgeConfig = await fs.readJson(configPath);
        const lock: ProjectLock = await fs.readJson(lockPath);

        // 1. Validate Migration Target
        const validComponents = ['frontend', 'backend', 'database', 'cache', 'mobile'];
        if (!validComponents.includes(component)) {
          logger.error(`Invalid component '${component}'. Must be one of: ${validComponents.join(', ')}`);
          process.exit(1);
        }

        logger.info(`Planning migration: ${component} -> ${target}`);
        
        // Setup speculative config
        const targetConfig = { ...config, [component]: target === 'none' ? undefined : target };

        // 2. Compute the Difference Engine
        const targetTemplates = await resolveTemplates(targetConfig);
        const diff = computeTemplateDiff(lock, targetTemplates);

        if (diff.templatesToRemove.length === 0 && diff.templatesToAdd.length === 0) {
          logger.success('The stack is already in the target state. Nothing to migrate.');
          process.exit(0);
        }

        logger.warn('\nThis migration will perform the following actions:');
        if (diff.templatesToRemove.length > 0) {
          console.log('\n  REMOVE:');
          diff.templatesToRemove.forEach(t => console.log(`    - ${t.type}/${t.name} (${t.language})`));
        }
        if (diff.templatesToAdd.length > 0) {
          console.log('\n  ADD:');
          diff.templatesToAdd.forEach(t => console.log(`    - ${t.manifest.type}/${t.manifest.name} (${t.manifest.language})`));
        }

        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: '\nSwitching stack components may require data migration or manual code adjustments. Continue and create backup?',
            default: false
          }
        ]);

        if (!confirm) {
          logger.info('Migration aborted.');
          process.exit(0);
        }

        // 3. Create Backup
        const backupPath = await createBackup(projectRoot);
        
        spinnerInst = logger.spinner('Executing migration...');

        // 4. Clean out old templates
        for (const t of diff.templatesToRemove) {
          if (t.removes && t.removes.length > 0) {
            await applyRemoves(projectRoot, t.removes);
          }
        }

        // 5. Generate new templates and rebuild lock file
        await generateProject(targetConfig, projectRoot);

        spinnerInst.succeed('Migration completed successfully!');
        logger.info(`\nA backup of the previous state was saved to: ${backupPath}\n`);

      } catch (err: any) {
        if (spinnerInst) spinnerInst.fail('Migration failed');
        logger.error(err.message || 'An error occurred during project migration.');
        process.exit(1);
      }
    });
}
