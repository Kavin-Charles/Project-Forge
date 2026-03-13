const path = require('path');
const { generateProject } = require('./dist/core/generator');
const { executePostInstallScripts } = require('./dist/core/scriptEngine');

const mockConfig = {
  projectName: "ksvin",
  projectType: "fullstack",
  frontend: "nextjs",
  backend: "fastapi",
  database: "postgres",
  cache: "redis",
  dockerSupport: true
};

const outDir = path.resolve(__dirname, 'test-ksvin2');

async function test() {
  try {
    const templates = await generateProject(mockConfig, outDir);
    await executePostInstallScripts(templates, outDir);
    console.log(`Mock generation complete. Output in ${path.basename(outDir)}/`);
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
