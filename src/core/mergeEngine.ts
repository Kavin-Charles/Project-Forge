import * as fs from 'fs-extra';
import * as path from 'path';
import YAML from 'yaml';
import * as logger from '../utils/logger';

// --- Deep Merge Logic ---

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge(target: any, source: any): any {
  if (Array.isArray(target) && Array.isArray(source)) {
    // Arrays → merge unique values
    return Array.from(new Set([...target, ...source]));
  }

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: [] });
        target[key] = deepMerge(target[key], source[key]);
      } else {
        // Keep first value (target) unless it doesn't exist
        if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

// --- Strategy specific handlers ---

export async function mergeFile(targetPath: string, sourcePath: string): Promise<void> {
  if (!fs.existsSync(targetPath)) {
    await fs.copy(sourcePath, targetPath);
    return;
  }

  const ext = path.extname(targetPath).toLowerCase();
  
  try {
    if (ext === '.json') {
      const targetData = await fs.readJson(targetPath);
      const sourceData = await fs.readJson(sourcePath);
      const merged = deepMerge(targetData, sourceData);
      await fs.writeJson(targetPath, merged, { spaces: 2 });
    } 
    else if (ext === '.yml' || ext === '.yaml') {
      const targetContent = await fs.readFile(targetPath, 'utf8');
      const sourceContent = await fs.readFile(sourcePath, 'utf8');
      const targetData = YAML.parse(targetContent) || {};
      const sourceData = YAML.parse(sourceContent) || {};
      const merged = deepMerge(targetData, sourceData);
      await fs.writeFile(targetPath, YAML.stringify(merged));
    }
    else {
      // Basic text append for undefined structured files like .env or go.mod
      const targetContent = await fs.readFile(targetPath, 'utf8');
      const sourceContent = await fs.readFile(sourcePath, 'utf8');
      await fs.writeFile(targetPath, targetContent + '\n' + sourceContent);
    }
  } catch (err: any) {
    logger.warn(`Conflict detected or merge failed for: ${targetPath} - ${err.message}`);
  }
}

export async function injectFile(targetPath: string, sourcePath: string): Promise<void> {
  if (!fs.existsSync(targetPath)) {
    await fs.copy(sourcePath, targetPath);
    return;
  }

  const targetContent = await fs.readFile(targetPath, 'utf8');
  const sourceContent = await fs.readFile(sourcePath, 'utf8');

  // We look for markers in the source file, and inject their content into the target file under the same marker.
  // source file format expected:
  // # forge:database
  // MONGO_URI=xxx
  
  const markerRegex = /(# forge:[a-zA-Z0-9]+)/g;
  const blocks = sourceContent.split(markerRegex);
  
  // blocks[0] is preamble, blocks[1] is marker, blocks[2] is content, blocks[3] is marker, etc.
  let newTargetContent = targetContent;
  
  for (let i = 1; i < blocks.length; i += 2) {
    const marker = blocks[i];
    const contentToInject = blocks[i+1].trim();
    
    // Inject content into target under the marker
    if (newTargetContent.includes(marker)) {
      newTargetContent = newTargetContent.replace(
        marker,
        `${marker}\n${contentToInject}`
      );
    } else {
      newTargetContent += `\n${marker}\n${contentToInject}\n`;
    }
  }

  await fs.writeFile(targetPath, newTargetContent);
}

export async function copyFile(targetPath: string, sourcePath: string): Promise<void> {
  if (fs.existsSync(targetPath)) {
    logger.warn(`Conflict: Overwriting existing file without merge strategy: ${targetPath}`);
  }
  await fs.ensureDir(path.dirname(targetPath));
  await fs.copy(sourcePath, targetPath, { overwrite: true });
}

// --- Migration Un-Merge Logic ---

function deleteNestedKey(obj: any, objectPath: string) {
  const keys = objectPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) return;
    current = current[keys[i]];
  }
  delete current[keys[keys.length - 1]];
}

export async function applyRemoves(targetRoot: string, removes: string[]): Promise<void> {
  for (const removeRule of removes) {
    const splitIdx = removeRule.indexOf(':');
    if (splitIdx === -1) continue;
    
    const relPath = removeRule.substring(0, splitIdx);
    const targetKey = removeRule.substring(splitIdx + 1);
    
    const targetPath = path.join(targetRoot, relPath);
    if (!fs.existsSync(targetPath)) continue;

    const ext = path.extname(targetPath).toLowerCase();
    
    try {
      if (ext === '.json') {
        const data = await fs.readJson(targetPath);
        deleteNestedKey(data, targetKey);
        await fs.writeJson(targetPath, data, { spaces: 2 });
      } else if (ext === '.yml' || ext === '.yaml') {
        const content = await fs.readFile(targetPath, 'utf8');
        const data = YAML.parse(content) || {};
        deleteNestedKey(data, targetKey);
        await fs.writeFile(targetPath, YAML.stringify(data));
      } else {
        // Text file marker removal
        let content = await fs.readFile(targetPath, 'utf8');
        if (targetKey.startsWith('# forge:')) {
           // Clear everything between this marker and the next marker (or end of file), while leaving the marker itself intact so future templates can inject.
           // Regex matches the target marker, followed by any whitespace, then any characters lazily, until it hits either another marker or the end of the string.
           const regex = new RegExp(`(${targetKey}\\s*[\\s\\S]*?)(?=# forge:|$)`, 'g');
           content = content.replace(regex, `${targetKey}\n\n`);
           await fs.writeFile(targetPath, content);
        } else {
          // If it's not a marker, maybe just a string literal removal
          content = content.replace(targetKey, '');
          await fs.writeFile(targetPath, content);
        }
      }
      logger.info(`Pruned: ${targetKey} from ${relPath}`);
    } catch (err: any) {
      logger.warn(`Failed to prune ${targetKey} from ${relPath}: ${err.message}`);
    }
  }
}
