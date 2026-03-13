import inquirer from 'inquirer';

/**
 * Dynamic prompt flow specifically for Full Stack Applications.
 */
export async function runFullStackFlow(): Promise<Record<string, any>> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'frontend',
      message: 'Select a frontend framework:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Next.js', value: 'nextjs' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Svelte', value: 'svelte' },
      ],
    },
    {
      type: 'list',
      name: 'backend',
      message: 'Select a backend framework:',
      choices: [
        { name: 'Node.js (Express)', value: 'express' },
        { name: 'Node.js (Fastify)', value: 'fastify' },
        { name: 'Python (FastAPI)', value: 'fastapi' },
        { name: 'Go (Fiber)', value: 'fiber' },
      ],
    },
    {
      type: 'list',
      name: 'database',
      message: 'Select a database:',
      choices: [
        { name: 'PostgreSQL', value: 'postgres' },
        { name: 'MongoDB', value: 'mongodb' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'None', value: 'none' },
      ],
    },
    {
      type: 'list',
      name: 'cache',
      message: 'Include a caching layer?',
      choices: [
        { name: 'Redis', value: 'redis' },
        { name: 'None', value: 'none' },
      ],
    },
    {
      type: 'confirm',
      name: 'dockerSupport',
      message: 'Enable Docker support (generates docker-compose.yml)?',
      default: true,
    },
  ]);

  return answers;
}
