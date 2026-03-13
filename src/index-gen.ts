import { Command } from 'commander';
import { registerCreateCommand } from './commands/create';
import chalk from 'chalk';
import * as logger from './utils/logger';

const program = new Command();

program
  .name('forge-gen')
  .description('A modular, language-aware framework & application templating engine.\n' + chalk.gray('Supported Types: Full Stack (Web), Mobile App\nPlanned: System Application, AI/ML Service'))
  .version('1.0.0');

// Register the generator command exclusively
registerCreateCommand(program);

program.parseAsync(process.argv).catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
