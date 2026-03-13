export interface ForgeConfig {
  projectName: string;
  projectType: 'fullstack' | 'mobile' | 'aiml' | 'system';
  
  // Full Stack options
  frontend?: string;
  frontendLanguage?: string;
  backend?: string;
  backendLanguage?: string;
  database?: string;
  cache?: string;
  dockerSupport?: boolean;
  
  // Mobile options
  mobileFramework?: string;
  platformTarget?: string;
  backendIntegration?: boolean;
}
