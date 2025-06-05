import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { GitGraphPlugin } from '../src/plugin'

const md = MarkdownIt().use(GitGraphPlugin, {})
it('test', async () => {
  const svg = md.render(`\`\`\`git-graph showHash=false&showDate=false
[main]
8991ab29<ab315c05   'merge feature/dev_1'    2025-02-02
9091ab29            'add help.md'            2025-02-03
d920f7c1            'add README.md'          2025-02-01
[feature/dev_1]
ab315c05            'update index.md'        2025-02-03
910f0f0f            'something'              2025-02-03
0c5c0c05<d920f7c1   'add index.md'           2025-02-02
    \`\`\`
    `)
  expect(svg).toMatchInlineSnapshot(`"<svg width='40' height='175' xmlns='http://www.w3.org/2000/svg'><path d="M 30 37.5 C 26 17.5 14 32.5 10 12.5" stroke="#ffe119" stroke-width="2" fill="none" /><path d="M 10 137.5 C 14 117.5 26 132.5 30 112.5" stroke="#ffe119" stroke-width="2" fill="none" /><line x1="10" y1="87.5" x2="10" y2="12.5" stroke="#e6194b" stroke-width="2" /><line x1="30" y1="62.5" x2="30" y2="37.5" stroke="#ffe119" stroke-width="2" /><line x1="30" y1="112.5" x2="30" y2="62.5" stroke="#ffe119" stroke-width="2" /><line x1="10" y1="137.5" x2="10" y2="87.5" stroke="#e6194b" stroke-width="2" /><line x1="10" y1="150" x2="10" y2="137.5" stroke="#e6194b" stroke-width="2" /><circle id="p-0-8991ab29" cx="10" cy="12.5" r="5" fill="#e6194b" /><circle id="p-0-ab315c05" cx="30" cy="37.5" r="5" fill="#ffe119" /><circle id="p-0-910f0f0f" cx="30" cy="62.5" r="5" fill="#ffe119" /><circle id="p-0-9091ab29" cx="10" cy="87.5" r="5" fill="#e6194b" /><circle id="p-0-0c5c0c05" cx="30" cy="112.5" r="5" fill="#ffe119" /><circle id="p-0-d920f7c1" cx="10" cy="137.5" r="5" fill="#e6194b" /></svg>"`)
})
