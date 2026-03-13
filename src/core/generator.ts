import * as fs from 'fs-extra';
import * as path from 'path';
import { ForgeConfig } from '../types/ForgeConfig';
import { TemplateManifest } from '../types/TemplateManifest';
import { resolveLanguage } from './languageResolver';
import { copyFile, mergeFile, injectFile } from './mergeEngine';
import * as logger from '../utils/logger';

// When running from dist/core/generator.js, jump up two directories to the root, then into src/templates
const TEMPLATES_DIR = path.resolve(__dirname, '../../src/templates');

interface ResolvedTemplate {
  manifestPath: string;
  filesDir: string;
  manifest: TemplateManifest;
}

export async function generateProject(config: ForgeConfig, outputRoot: string): Promise<void> {
  await fs.ensureDir(outputRoot);

  // Step 3 & 4: Resolve languages for the selected frameworks
  config.frontendLanguage = resolveLanguage(config.frontend);
  config.backendLanguage = resolveLanguage(config.backend);

  logger.info(`Resolved frontend language: ${config.frontendLanguage}`);
  logger.info(`Resolved backend language: ${config.backendLanguage}`);

  // Step 5: Resolve templates to apply
  const activeTemplates: ResolvedTemplate[] = [];

  const addTemplate = async (templatePath: string) => {
    const manifestPath = path.join(TEMPLATES_DIR, templatePath, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = await fs.readJson(manifestPath) as TemplateManifest;
      activeTemplates.push({
        manifestPath,
        filesDir: path.join(TEMPLATES_DIR, templatePath, 'files'),
        manifest,
      });
      logger.info(`Resolved template: ${templatePath}`);
    }
  };

  // 1. Base Project Template
  await addTemplate('base');

  // 2. Frontend Template
  if (config.frontend) {
    await addTemplate(`frontend/${config.frontend}/${config.frontendLanguage}`);
  }

  // 3. Backend Template
  if (config.backend) {
    await addTemplate(`backend/${config.backend}/${config.backendLanguage}`);
  }

  // 3.5 Mobile Template
  if (config.mobileFramework) {
    const mobileLang = resolveLanguage(config.mobileFramework);
    await addTemplate(`mobile/${config.mobileFramework}/${mobileLang}`);
  }

  // 4. Database Templates (Layered: Base + Language driver)
  if (config.database && config.database !== 'none') {
    await addTemplate(`database/${config.database}/base`);
    if (config.backendLanguage) {
      await addTemplate(`database/${config.database}/${config.backendLanguage}`);
    }
  }

  // 5. Cache Templates
  if (config.cache && config.cache !== 'none') {
    await addTemplate(`cache/${config.cache}`);
  }

  // 6. Infrastructure Templates
  if (config.dockerSupport) {
    await addTemplate('infra/docker');
  }

  // Step 6: Sort templates by priority (Lowest executes first)
  activeTemplates.sort((a, b) => a.manifest.priority - b.manifest.priority);

  // Step 7-9: Execute File rules from each manifest
  for (const template of activeTemplates) {
    logger.info(`Applying template: ${template.manifest.name} (Priority ${template.manifest.priority})`);
    
    // Copy Static Files
    if (template.manifest.files?.copy) {
      for (const file of template.manifest.files.copy) {
        const sourcePath = path.join(template.filesDir, file);
        const targetPath = path.join(outputRoot, file);
        await copyFile(targetPath, sourcePath);
      }
    }

    // Merge Structured Files
    if (template.manifest.files?.merge) {
      for (const file of template.manifest.files.merge) {
        const sourcePath = path.join(template.filesDir, file);
        const targetPath = path.join(outputRoot, file);
        await mergeFile(targetPath, sourcePath);
      }
    }

    // Inject Text Sections
    if (template.manifest.files?.inject) {
      for (const file of template.manifest.files.inject) {
        const sourcePath = path.join(template.filesDir, file);
        const targetPath = path.join(outputRoot, file);
        await injectFile(targetPath, sourcePath);
      }
    }
  }

  // Step 10: Finalize Config in new project
  const configPath = path.join(outputRoot, 'forge.config.json');
  await fs.writeJson(configPath, config, { spaces: 2 });
}
