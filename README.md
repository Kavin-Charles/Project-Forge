# Forge Project Lifecycle Manager

`forge-gen` is an advanced modular project scaffolding and architectural evolution tool. It replaces rigid boilerplates with a dynamic engine capable of resolving, merging, and evolving multi-language project architectures over time.

## Architectural Tooling

The system is split into two specialized binaries:

1. **`forge-gen` (Global Scaffolder)**
   Used to scaffold entirely new projects.
   - Dynamic terminal prompts that traverse language and stack matrices.
   - Outputs robust monorepos supporting cross-language development.

2. **`forge` (Project Manager)**
   Used inside generated codebases to swap components.
   - Employs a `.forge/project.lock` history log.
   - Calculates real-time diffs to perform clean destructs of obsolete templates.
   - Auto-creates timestamped folder backups before migrating architectures.

---

## Quick Start

Ensure global NPM binaries are configured. To run locally from this repository:

```bash
npm install
npm run build
```

Link the executable binaries globally:
```bash
npm link
```

### Create a Project
```bash
forge-gen create <project-name>
```

The generator will stitch templates together and output the architecture, seamlessly injecting mapped configuration variables dynamically into the template source lines.

```text
project/
├── .forge/
│   ├── project.lock
│   └── backups/
├── apps/
│   ├── frontend/ 
│   └── backend/
├── infra/
├── forge.config.json
```

### Migrate a Project
To dynamically swap stack components (e.g. migrating from Fastify to Express), navigate inside the project root and execute the migration command:

```bash
cd <project-name>
forge migrate backend express
```

The difference engine will compute the exact settings, strings, and folders the previous template introduced and prune them securely using the internal Un-Merge regex engine prior to layering the new framework files.

---

## Core Features

- **Language Aware Routing:** Resolves generic frameworks down into specific language drivers cleanly based on the selected backend or frontend environment.
- **Deep Merging Engine:** JSON, YAML, and configuration blocks merge deeply together rather than simply overwriting files.
- **Variable Interpolation:** Drop `{{projectName}}` natively inside JSON templates and it swaps it out seamlessly in-memory prior to writing.
- **Post-Generation Automations:** Utilize the `"scripts": { "postInstall": "npm install" }` block in a `manifest.json` to natively execute shell initializations during generation.

---

## Modifying Templates

All template boilerplates live inside `src/templates/`.

Example `manifest.json`:
```json
{
  "name": "react",
  "type": "frontend",
  "language": "node",
  "priority": 10,
  "adds": [".env:VITE_PROXY"],
  "removes": [".env:OLD_VITE"],
  "scripts": {
    "postInstall": "cd apps/frontend && npm install"
  },
  "files": {
    "copy": ["apps/frontend/package.json"],
    "merge": ["docker-compose.yml"],
    "inject": [".env"]
  }
}
```

- **`priority`**: Guarantees files load in order (e.g. Backend loads before Database).
- **`adds/removes`**: The CLI engine utilizes this metadata to reverse-engineer and surgically prune prior variables out of configuration files during `forge migrate` cycles.
