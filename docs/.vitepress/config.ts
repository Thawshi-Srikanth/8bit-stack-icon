import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '8-bit Stack Icons',
  description: 'A pixel-art tech stack icon library.',
  base: '/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Icons', link: '/icons' },
      { text: 'Guide', link: '/guide/getting-started' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Contributing', link: '/guide/contributing' },
        ],
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Thawshi-Srikanth/8bit-stack-icon',
      },
    ],
  },
})
