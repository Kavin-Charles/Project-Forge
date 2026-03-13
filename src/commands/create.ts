import { Command } from 'commander';
import inquirer from 'inquirer';
import * as path from 'path';
import { runProjectTypePrompt } from '../prompts/projectTypePrompt';
import { generateProject } from '../core/generator';
import { executePostInstallScripts } from '../core/scriptEngine';
import { ForgeConfig } from '../types/ForgeConfig';
import * as logger from '../utils/logger';

export function registerCreateCommand(program: Command): void {
  program
    .command('create [project-name]')
    .description('Generate a new project scaffold')
    .action(async (projectName: string | undefined) => {
      logger.header('forge-gen — Modular Project Generator');
      let spinnerInst: any;

      try {
        // If name wasn't provided in the CLI args, prompt for it first
        let name = projectName;
        if (!name) {
          const answer = await inquirer.prompt([
            {
              type: 'input',
              name: 'projectName',
              message: 'What is your project name?',
              validate: (input: string) => input.trim() ? true : 'Project name is required',
            },
          ]);
          name = answer.projectName;
        }

        // Run the master router prompt which determines project type
        // and seamlessly hands off to the appropriate flow.
        const flowAnswers = await runProjectTypePrompt(name as string);

        // If flowAnswers is null, it means the user selected an
        // unsupported project type (aiml, system). The prompt already
        // displayed the warning, so we just exit gracefully.
        if (!flowAnswers) {
          process.exit(0);
        }

        // Build the final typed ForgeConfig
        const finalConfig: ForgeConfig = {
          projectName: name as string,
          projectType: flowAnswers.projectType,
          ...flowAnswers,
        };

        const outDir = path.resolve(process.cwd(), name as string);

        spinnerInst = logger.spinner('Generating modular project architecture at ' + outDir + '...');
        
        const templates = await generateProject(finalConfig, outDir);
        spinnerInst.text = 'Running post-generation setup...';
        await executePostInstallScripts(templates, outDir);
        
        spinnerInst.succeed('Project generated successfully!');
        logger.info('\nFinal Configuration Scope:\n');
        logger.logConfig(finalConfig);

      } catch (err: any) {
        if (spinnerInst) spinnerInst.fail('Generation failed');
        logger.error(err.message || 'An error occurred during project creation.');
        process.exit(1);
      }
    });
}
