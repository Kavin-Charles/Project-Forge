export interface TemplateManifest {
  name: string;
  type: string; // e.g., 'backend', 'frontend', 'database', 'cache', 'infra'
  language: string; // e.g., 'node', 'go', 'python', 'generic'
  priority: number; // e.g., base (0), frontend (10), backend (20), database (30), cache (40), infra (50)
  files: {
    copy: string[];
    merge: string[];
    inject: string[];
  };
}
