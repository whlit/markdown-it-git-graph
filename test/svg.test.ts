import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { GitGraphPlugin } from '../plugin'

const isDev = process.env.NODE_ENV === 'dev'

const md = MarkdownIt().use(GitGraphPlugin, {
  theme: {
    pointSpace: 80,
  },
})
it.runIf(isDev)('test', async () => {
  const svg = md.render(`\`\`\`git-graph
    [main]
    abc test
    bbc test2
    [feature]
    ccc test3
    \`\`\`
    `)
  expect(svg).toMatchSnapshot()
})
