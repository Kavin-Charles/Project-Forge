import { ProjectLock, AppliedTemplate } from '../types/ProjectLock';
import { ResolvedTemplate } from './generator';

export interface MigrationDiff {
  templatesToRemove: AppliedTemplate[];
  templatesToAdd: ResolvedTemplate[];
}

export function computeTemplateDiff(
  currentLock: ProjectLock,
  targetTemplates: ResolvedTemplate[]
): MigrationDiff {
  
  // A template is uniquely identified by its name, type, and language
  const getTemplateId = (t: { name: string, type: string, language: string }) => 
    `${t.type}:${t.name}:${t.language}`;

  const currentMap = new Map<string, AppliedTemplate>();
  currentLock.appliedTemplates.forEach(t => currentMap.set(getTemplateId(t), t));

  const targetMap = new Map<string, ResolvedTemplate>();
  targetTemplates.forEach(t => targetMap.set(getTemplateId(t.manifest), t));

  const templatesToRemove: AppliedTemplate[] = [];
  const templatesToAdd: ResolvedTemplate[] = [];

  // Find what to remove (in current, but not in target)
  for (const [id, t] of currentMap.entries()) {
    if (!targetMap.has(id)) {
      templatesToRemove.push(t);
    }
  }

  // Find what to add (in target, but not in current)
  for (const [id, t] of targetMap.entries()) {
    if (!currentMap.has(id)) {
      templatesToAdd.push(t);
    }
  }

  // Note: we reverse the remove list so we remove highest priority (like infra) before base templates.
  templatesToRemove.sort((a, b) => b.priority - a.priority);
  
  // Additions are sorted by normal priority (lowest first)
  templatesToAdd.sort((a, b) => a.manifest.priority - b.manifest.priority);

  return { templatesToRemove, templatesToAdd };
}
