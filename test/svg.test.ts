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
  expect(svg).toMatchInlineSnapshot(`"<table class="gg-table"><tbody><tr class="gg-td-svg"><td rowSpan="99999"><svg width='40' height='144' xmlns='http://www.w3.org/2000/svg'><path d="M 30 36 C 26 16.8 14 31.200000000000003 10 12" stroke="#ffe119" stroke-width="2" fill="none" /><path d="M 10 132 C 14 112.80000000000001 26 127.20000000000002 30 108" stroke="#ffe119" stroke-width="2" fill="none" /><line x1="10" y1="84" x2="10" y2="12" stroke="#e6194b" stroke-width="2" /><line x1="30" y1="60" x2="30" y2="36" stroke="#ffe119" stroke-width="2" /><line x1="30" y1="108" x2="30" y2="60" stroke="#ffe119" stroke-width="2" /><line x1="10" y1="132" x2="10" y2="84" stroke="#e6194b" stroke-width="2" /><line x1="10" y1="120" x2="10" y2="132" stroke="#e6194b" stroke-width="2" /><circle id="p-0-8991ab29" cx="10" cy="12" r="5" fill="#e6194b" /><circle id="p-0-ab315c05" cx="30" cy="36" r="5" fill="#ffe119" /><circle id="p-0-910f0f0f" cx="30" cy="60" r="5" fill="#ffe119" /><circle id="p-0-9091ab29" cx="10" cy="84" r="5" fill="#e6194b" /><circle id="p-0-0c5c0c05" cx="30" cy="108" r="5" fill="#ffe119" /><circle id="p-0-d920f7c1" cx="10" cy="132" r="5" fill="#e6194b" /></svg></td></tr><tr><td>merge feature/dev_1</td><td>2025/2/2 08:00</td><td>8991ab29</td></tr><tr><td>update index.md</td><td>2025/2/3 08:00</td><td>ab315c05</td></tr><tr><td>something</td><td>2025/2/3 08:00</td><td>910f0f0f</td></tr><tr><td>add help.md</td><td>2025/2/3 08:00</td><td>9091ab29</td></tr><tr><td>add index.md</td><td>2025/2/2 08:00</td><td>0c5c0c05</td></tr><tr><td>add README.md</td><td>2025/2/1 08:00</td><td>d920f7c1</td></tr></tbody></table>"`)
})
