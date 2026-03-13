import { Command } from 'commander';
import { registerCreateCommand } from './commands/create';
import * as logger from './utils/logger';

const program = new Command();

program
  .name('forge-gen')
  .description(`
Modular developer tool for generating project templates cleanly.

✨ Supported Project Types:
  • Full Stack Applications
  • Mobile Applications

🚀 Planned (Not Yet Supported):
  • AI / ML Projects
  • System Applications
  `)
  .version('1.0.0');

// Register primary commands
registerCreateCommand(program);

program.parseAsync(process.argv).catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
