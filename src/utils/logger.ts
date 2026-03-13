import chalk from 'chalk';
import ora from 'ora';

const LOG_LEVELS = {
  info: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  bold: chalk.bold,
};

export function info(msg: string): void {
  console.log(`${LOG_LEVELS.info('ℹ')} ${msg}`);
}

export function success(msg: string): void {
  console.log(`${LOG_LEVELS.success('✔')} ${msg}`);
}

export function warn(msg: string): void {
  console.log(`${LOG_LEVELS.warn('⚠')} ${msg}`);
}

export function error(msg: string): void {
  console.error(`${LOG_LEVELS.error('✖')} ${msg}`);
}

export function header(msg: string): void {
  console.log(`\n${LOG_LEVELS.bold(LOG_LEVELS.info(`━━━ ${msg} ━━━`))}\n`);
}

export function logConfig(config: any): void {
  console.log(chalk.gray(JSON.stringify(config, null, 2)));
}

export function spinner(text: string) {
  return ora(text).start();
}
