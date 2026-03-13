export interface AppliedTemplate {
  name: string;
  type: string;
  language: string;
  priority: number;
  addedVariables?: string[];
  removes?: string[];
  scripts?: Record<string, string>;
}

export interface ProjectLock {
  version: string;
  appliedTemplates: AppliedTemplate[];
  lastMigratedAt?: string;
}
