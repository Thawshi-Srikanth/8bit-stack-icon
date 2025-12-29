# 8-bit Stack Icons (Monorepo)

A library of 8-bit / pixel-art style icons for popular tech stack technologies.
Now supporting multiple frameworks!

## Packages

| Package             | Status       |
| ------------------- | ------------ |
| `@8bit-icon/react`  | ✅ Ready     |
| `@8bit-icon/vue`    | ✅ Ready     |
| `@8bit-icon/svelte` | ✅ Ready     |
| `@8bit-icon/icons`  | ✅ Core SVGs |

## Installation

```bash
# React
npm install @8bit-icon/react

# Vue
npm install @8bit-icon/vue

# Svelte
npm install @8bit-icon/svelte
```

## Usage

### React

```tsx
import { JavascriptIcon } from '@8bit-icon/react'
;<JavascriptIcon width={32} height={32} />
```

### Vue

```vue
<script setup>
import { JavascriptIcon } from '@8bit-icon/vue'
</script>

<template>
  <JavascriptIcon />
</template>
```

### Svelte

```svelte
<script>
  import { JavascriptIcon } from "@8bit-icon/svelte";
</script>

<JavascriptIcon />
```

## Development

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Add new icons**:
   Place 8-bit SVGs in `packages/icons/src/`.

3. **Build**:

   ```bash
   bun run build
   ```

   This automagically generates the code for all framework packages.
