import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { GitGraphPlugin } from '../src/plugin'

const md = MarkdownIt().use(GitGraphPlugin, {
  theme: {
    pointSpace: 80,
  },
})
it('test', async () => {
  const svg = md.render(`\`\`\`git-graph colors=red,blue,green,yellow&showHash=false
    [main]
    abc test
    bbc test2
    [feature]
    ccc test3
    \`\`\`
    `)
  expect(svg)
})
