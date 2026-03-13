const path = require('path');
const { generateProject } = require('./dist/core/generator');

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

generateProject(mockConfig, outDir)
  .then(() => {
    console.log("Mock generation complete. Output in test-ksvin/");
  })
  .catch((err) => {
    console.error("Failed:", err);
  });
