import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { GitGraphPlugin } from '../plugin'

const md = MarkdownIt().use(GitGraphPlugin)

it('test', async () => {
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
