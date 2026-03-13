import inquirer from 'inquirer';
import { runFullStackFlow } from './flows/fullstack';
import { runMobileFlow } from './flows/mobile';
import * as logger from '../utils/logger';

export type SupportedProjectType = 'fullstack' | 'mobile';
export type UnsupportedProjectType = 'aiml' | 'system';
export type AnyProjectType = SupportedProjectType | UnsupportedProjectType;

/**
 * The master prompt that determines the project trajectory.
 * Routes Supported project types to their respective prompt flows.
 * Intercepts Unsupported project types and halts generation.
 */
export async function runProjectTypePrompt(projectName: string): Promise<Record<string, any> | null> {
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project do you want to create?',
      choices: [
        { name: 'Full Stack Application', value: 'fullstack' },
        { name: 'Mobile App', value: 'mobile' },
        { name: 'AI / ML (Not yet supported)', value: 'aiml' },
        { name: 'System Application (Not yet supported)', value: 'system' },
      ],
    },
  ]);

  // Intercept unsupported types
  if (projectType === 'aiml' || projectType === 'system') {
    const formattedType = projectType === 'aiml' ? 'AI / ML' : 'System Application';
    logger.warn(`\n${formattedType} project generation is not yet supported. This feature will be available in a future release.\n`);
    return null; // Signals the CLI to stop
  }

  // Route to the appropriate dynamic flow
  let flowAnswers: Record<string, any> = {};

  if (projectType === 'fullstack') {
    flowAnswers = await runFullStackFlow();
  } else if (projectType === 'mobile') {
    flowAnswers = await runMobileFlow();
  }

  return {
    projectType,
    ...flowAnswers,
  };
}
