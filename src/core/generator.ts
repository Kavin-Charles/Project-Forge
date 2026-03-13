import * as fs from 'fs-extra';
import * as path from 'path';
import { ForgeConfig } from '../types/ForgeConfig';
import { TemplateManifest } from '../types/TemplateManifest';
import { resolveLanguage } from './languageResolver';
import { copyFile, mergeFile, injectFile } from './mergeEngine';
import * as logger from '../utils/logger';

// When running from dist/core/generator.js, jump up two directories to the root, then into src/templates
const TEMPLATES_DIR = path.resolve(__dirname, '../../src/templates');

export interface ResolvedTemplate {
  manifestPath: string;
  filesDir: string;
  manifest: TemplateManifest;
}

export async function resolveTemplates(config: ForgeConfig): Promise<ResolvedTemplate[]> {
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

  await addTemplate('base');

  if (config.frontend) {
    await addTemplate(`frontend/${config.frontend}/${config.frontendLanguage}`);
  }

  if (config.backend) {
    await addTemplate(`backend/${config.backend}/${config.backendLanguage}`);
  }

  if (config.mobileFramework) {
    const mobileLang = resolveLanguage(config.mobileFramework);
    await addTemplate(`mobile/${config.mobileFramework}/${mobileLang}`);
  }

  if (config.database && config.database !== 'none') {
    await addTemplate(`database/${config.database}/base`);
    if (config.backendLanguage) {
      await addTemplate(`database/${config.database}/${config.backendLanguage}`);
    }
  }

  if (config.cache && config.cache !== 'none') {
    await addTemplate(`cache/${config.cache}`);
  }

  if (config.dockerSupport) {
    await addTemplate('infra/docker');
  }

  // Sort templates by priority (Lowest executes first)
  activeTemplates.sort((a, b) => a.manifest.priority - b.manifest.priority);
  return activeTemplates;
}

export async function generateProject(config: ForgeConfig, outputRoot: string): Promise<ResolvedTemplate[]> {
  await fs.ensureDir(outputRoot);

  // Step 3 & 4: Resolve languages for the selected frameworks
  config.frontendLanguage = resolveLanguage(config.frontend);
  config.backendLanguage = resolveLanguage(config.backend);

  logger.info(`Resolved frontend language: ${config.frontendLanguage}`);
  logger.info(`Resolved backend language: ${config.backendLanguage}`);

  // Step 5: Resolve templates to apply
  const activeTemplates = await resolveTemplates(config);

  // Step 7-9: Execute File rules from each manifest
  for (const template of activeTemplates) {
    logger.info(`Applying template: ${template.manifest.name} (Priority ${template.manifest.priority})`);
    
    // Copy Static Files
    if (template.manifest.files?.copy) {
      for (const file of template.manifest.files.copy) {
        const sourcePath = path.join(template.filesDir, file);
        const targetPath = path.join(outputRoot, file);
        await copyFile(targetPath, sourcePath, config);
      }
    }

    // Merge Structured Files
    if (template.manifest.files?.merge) {
      for (const file of template.manifest.files.merge) {
        const sourcePath = path.join(template.filesDir, file);
        const targetPath = path.join(outputRoot, file);
        await mergeFile(targetPath, sourcePath, config);
      }
    }

    // Inject Text Sections
    if (template.manifest.files?.inject) {
      for (const file of template.manifest.files.inject) {
        const sourcePath = path.join(template.filesDir, file);
        const targetPath = path.join(outputRoot, file);
        await injectFile(targetPath, sourcePath, config);
      }
    }
  }

  // Step 10: Finalize Config in new project
  const configPath = path.join(outputRoot, 'forge.config.json');
  await fs.writeJson(configPath, config, { spaces: 2 });

  // Step 11: Create Project Lock
  const forgeDir = path.join(outputRoot, '.forge');
  await fs.ensureDir(forgeDir);

  const lockPath = path.join(forgeDir, 'project.lock');
  const projectLock = {
    version: '1.0.0',
    appliedTemplates: activeTemplates.map(t => ({
      name: t.manifest.name,
      type: t.manifest.type,
      language: t.manifest.language,
      priority: t.manifest.priority,
      addedVariables: t.manifest.adds || [],
      removes: t.manifest.removes || [],
      scripts: t.manifest.scripts || {}
    })),
    lastMigratedAt: new Date().toISOString()
  };
  
  await fs.writeJson(lockPath, projectLock, { spaces: 2 });
  
  return activeTemplates;
}
