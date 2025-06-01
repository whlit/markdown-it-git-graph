import { defineConfig } from 'vitepress'
import { GitGraphPlugin } from '../src/plugin'

export default defineConfig({
  title: 'markdown-git-graph',
  srcDir: 'docs',
  markdown: {
    config: (md) => {
      md.use(GitGraphPlugin)
    },
  },
  themeConfig: {
    nav: [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Example',
        link: '/example/',
      },
    ],
    sidebar: {
      '/example/': [
        {
          link: 'index',
        },
      ],
    },
  },
})
