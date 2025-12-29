import { join } from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = join(ROOT_DIR, 'packages');

const packages = [
  {
    name: 'react',
    pkgName: '@8bit-stack-icon/react',
    usage: `
## Installation

\`\`\`bash
npm install @8bit-stack-icon/react
# or
yarn add @8bit-stack-icon/react
# or
pnpm add @8bit-stack-icon/react
# or
bun add @8bit-stack-icon/react
\`\`\`

## Usage

\`\`\`tsx
import { StackIcon } from '@8bit-stack-icon/react';

function App() {
  return (
    <StackIcon name="react" size={32} />
  );
}
\`\`\`
`
  },
  {
    name: 'vue',
    pkgName: '@8bit-stack-icon/vue',
    usage: `
## Installation

\`\`\`bash
npm install @8bit-stack-icon/vue
# or
yarn add @8bit-stack-icon/vue
# or
pnpm add @8bit-stack-icon/vue
# or
bun add @8bit-stack-icon/vue
\`\`\`

## Usage

\`\`\`vue
<script setup>
import { StackIcon } from '@8bit-stack-icon/vue';
</script>

<template>
  <StackIcon name="vue" :size="32" />
</template>
\`\`\`
`
  },
  {
    name: 'svelte',
    pkgName: '@8bit-stack-icon/svelte',
    usage: `
## Installation

\`\`\`bash
npm install @8bit-stack-icon/svelte
# or
yarn add @8bit-stack-icon/svelte
# or
pnpm add @8bit-stack-icon/svelte
# or
bun add @8bit-stack-icon/svelte
\`\`\`

## Usage

\`\`\`svelte
<script>
  import { StackIcon } from '@8bit-stack-icon/svelte';
</script>

<StackIcon name="svelte" size={32} />
\`\`\`
`
  }
];

async function generateReadmes() {
  console.log('Generating READMEs...');
  
  const rootReadme = await readFile(join(ROOT_DIR, 'README.md'), 'utf-8');
  
  // Extract common sections: Start until "## Packages" or "## Installation"
  // The root README starts with Title + Description.
  const commonContent = rootReadme.split('## Packages')[0].trim();

  // Add icons package to the list if it's published
  const allPackages = [
    ...packages,
    {
      name: 'icons',
      pkgName: '@8bit-stack-icon/icons',
      usage: `
## Installation

\`\`\`bash
npm install @8bit-stack-icon/icons
\`\`\`

## Usage

This package contains the raw SVGs.

\`\`\`javascript
import stack from '@8bit-stack-icon/icons/src/stack.svg';
\`\`\`
`
    }
  ];
  
  for (const pkg of allPackages) {
    const pkgPath = join(PACKAGES_DIR, pkg.name);
    
    // Check if package dir exists
    try {
        await readdir(pkgPath);
    } catch {
        console.warn(`Skipping ${pkg.name} as directory does not exist`);
        continue;
    }

    const content = `
${commonContent}

${pkg.usage}

## License

This project is licensed under the MIT License.
`.trim();

    await writeFile(join(pkgPath, 'README.md'), content);
    console.log(`Generated README for ${pkg.name}`);
  }
}

generateReadmes().catch(console.error);
