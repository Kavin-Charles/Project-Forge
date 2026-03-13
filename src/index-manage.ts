import { Command } from 'commander';
import { registerMigrateCommand } from './commands/migrate';
import { registerRunCommand } from './commands/run';
import chalk from 'chalk';
import * as logger from './utils/logger';

const program = new Command();

program
  .name('forge')
  .description('The Forge Project Lifecycle Manager.\n' + chalk.gray('Used inside generated projects to safely evolve architecture components.'))
  .version('1.0.0');

// Register the lifecycle management commands exclusively
registerMigrateCommand(program);

registerRunCommand(program);

program.parseAsync(process.argv).catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
