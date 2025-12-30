---
layout: home

hero:
  name: '8-Bit'
  text: 'Stack Icons'
  tagline: 'A collection of 8-bit icons for popular tech stack technologies.'
  image:
    src: /logo.svg
    alt: 8-bit Stack Icons Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Browse Icons
      link: /icons

features:
  - title: Multi-Framework
    details: React, Vue, Svelte supported out of the box.
  - title: Pixel Perfect
    details: Designed on a 16x16 grid for crisp rendering.
  - title: TypeScript
    details: Fully typed for a great developer experience.
  - title: Tree Shakeable
    details: Only bundle the icons you use.
  - title: SSR Ready
    details: Works perfectly with Next.js, Nuxt, and SvelteKit.
---

<div class="home-content">

## Installation

Getting started is easy. Install the package using your favorite package manager.

::: code-group

```bash [npm]
npm install @8bit-stack-icon/react
# or vue, svelte
```

```bash [bun]
bun add @8bit-stack-icon/react
# or vue, svelte
```

:::

## Usage

Import and use icons just like any other component.

::: code-group

```jsx [React]
import { ReactIcon } from '@8bit-stack-icon/react'

function App() {
  return <ReactIcon size={32} />
}
```

```vue [Vue]
<script setup>
import { VueIcon } from '@8bit-stack-icon/vue'
</script>

<template>
  <VueIcon :size="32" />
</template>
```

```svelte [Svelte]
<script>
  import { SvelteIcon } from '@8bit-stack-icon/svelte';
</script>

<SvelteIcon size={32} />
```

:::

## Why 8-bit?

Because nostalgia is a powerful thing! In a world of sleek, vector-perfect corporate design, sometimes you just need to bring back the charm of the retro era. These icons are perfect for:

- **Gaming Portfolios**: Show off your stack with style.
- **Fun Side Projects**: Add some personality to your apps.
- **Retro Themed UIs**: Complete the look.

</div>
