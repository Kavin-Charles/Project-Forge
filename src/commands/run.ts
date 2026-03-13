import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import * as logger from '../utils/logger';
import { ProjectLock } from '../types/ProjectLock';

const colors = [chalk.cyan, chalk.magenta, chalk.green, chalk.yellow, chalk.blue, chalk.redBright];

export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Boot the entire project architecture concurrently')
    .action(async () => {
      const projectRoot = process.cwd();
      const lockPath = path.join(projectRoot, '.forge', 'project.lock');

      if (!fs.existsSync(lockPath)) {
        logger.error('No .forge/project.lock found. Are you inside a generated forge project?');
        process.exit(1);
      }

      let lockInfo: ProjectLock;
      try {
        lockInfo = await fs.readJson(lockPath);
      } catch (e) {
        logger.error('Failed to read .forge/project.lock');
        process.exit(1);
      }

      // Collect all 'run' scripts
      const tasks: { name: string; script: string; color: chalk.Chalk }[] = [];
      let colorIdx = 0;

      for (const t of lockInfo.appliedTemplates) {
        if (t.scripts?.run) {
          tasks.push({
            name: t.name,
            script: t.scripts.run,
            color: colors[colorIdx % colors.length]
          });
          colorIdx++;
        }
      }

      if (tasks.length === 0) {
        logger.warn('No executable "run" scripts defined in the active project templates.');
        process.exit(0);
      }

      logger.info(chalk.bold(`\n🚀 Igniting Forge Ecosystem...\n`));

      // Spawn concurrently
      for (const task of tasks) {
        logger.info(`Starting ${task.color(task.name)}: ${chalk.gray(task.script)}`);
        
        const child = spawn(task.script, { 
          cwd: projectRoot, 
          shell: true,
          env: process.env // inherit env
        });

        child.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              console.log(`${task.color(`[${task.name}]`)} ${line}`);
            }
          }
        });

        child.stderr.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              console.log(`${chalk.red(`[${task.name} ERROR]`)} ${line}`);
            }
          }
        });

        child.on('exit', (code) => {
          if (code !== 0) {
            console.log(`${chalk.red(`[${task.name}]`)} Process exited with code ${code}`);
          }
        });
      }
    });
}
