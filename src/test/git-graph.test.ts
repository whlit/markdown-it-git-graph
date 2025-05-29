import MarkdownIt from 'markdown-it'
import { expect, it } from 'vitest'
import { getBranches, gitGraphPlugin } from '../plugin'

const md = MarkdownIt().use(gitGraphPlugin)

it('branchs', async () => {
  const tester = (text: string) => {
    const branches = getBranches(text)
    const expects = {
      branchSizeToBe: (len: number) => {
        expect(branches.length).toBe(len)
        return expects
      },
      branchNameContains: (name: string) => {
        expect(branches.some(b => b.name === name)).toBe(true)
        return expects
      },
      allCommitSizeToBe: (len: number) => {
        expect(
          branches.reduce((pre, curr) => pre + curr.commits.length, 0),
        ).toBe(len)
        return expects
      },
      branchCommitSizeToBe: (name: string, len: number) => {
        expect(branches.find(b => b.name === name)?.commits.length).toBe(len)
        return expects
      },
    }
    return expects
  }

  const branchExpect = (
    text: string,
    branchSize: number,
    branchName: string,
    branchCommitSize: number,
    allCommitSize: number,
  ) => {
    return tester(text)
      .branchSizeToBe(branchSize)
      .branchNameContains(branchName)
      .branchCommitSizeToBe(branchName, branchCommitSize)
      .allCommitSizeToBe(allCommitSize)
  }

  // k k
  branchExpect('k k', 1, 'main', 1, 1)
  // 数字
  branchExpect('1 k', 1, 'main', 1, 1)
  // 多个空格
  branchExpect('1 kk l al', 1, 'main', 1, 1)
  // 带单引号
  branchExpect('\'k k\' k', 1, 'main', 1, 1)
  // 单个单引号
  branchExpect('k \'k', 1, 'main', 1, 1)
  // 多个单引号且带空格
  branchExpect('\'k \' \'k\'', 1, 'main', 1, 1)
  // 多个commit
  branchExpect(
    `k k k
    j j j
    i i i
    `,
    1,
    'main',
    3,
    3,
  )
  // 自定义分支名
  branchExpect(
    `[k]
    j j j
    i i i
    `,
    1,
    'k',
    2,
    2,
  )
  // 分支名行带额外字符
  branchExpect(
    `[main jkk] 
    k k k`,
    1,
    'main jkk',
    1,
    1,
  )
  // 分支括号后带其他字符
  branchExpect(
    `[main] jk
    k k k`,
    1,
    'main',
    2,
    2,
  ) // 被识别为commit
  // 多个分支
  branchExpect(
    `[main] 
    k k k
    kk j
    [dev]
    j j j
    i i i
    `,
    2,
    'main',
    2,
    4,
  )
})

it('svg', async () => {
  const svg = md.render(`\`\`\`git-graph
    [main]
    abc sonmething
    bbc 'do something'
    kqi<bai 'merge dev to main'
    [dev]
    kqj 'do something' 2
    bai 'do something2'
    \`\`\``)
  expect(svg).toBe(`<svg width='350' height='150' xmlns='http://www.w3.org/2000/svg'>
  <line x1="15" y1="137.5" x2="15" y2="125" stroke="#e6194b" stroke-width="2" />
  <line x1="15" y1="125" x2="15" y2="100" stroke="#e6194b" stroke-width="2" />
  <line x1="15" y1="100" x2="15" y2="50" stroke="#e6194b" stroke-width="2" />
  <line x1="30" y1="137.5" x2="30" y2="25" stroke="#3cb44b" stroke-width="2" />
  <line x1="30" y1="25" x2="30" y2="75" stroke="#3cb44b" stroke-width="2" />
  <path d="M 30 75 C 27 55 18 70 15 50" stroke="#3cb44b" stroke-width="2" fill="none" />
  <circle id="p-abc" cx="15" cy="125" r="5" fill="#e6194b" /> <path id="tp-abc" d="M 45 130 L 245 130"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-abc">abc sonmething</textPath></text>
  <circle id="p-bbc" cx="15" cy="100" r="5" fill="#e6194b" /> <path id="tp-bbc" d="M 45 105 L 245 105"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-bbc">bbc 'do something'</textPath></text>
  <circle id="p-kqi" cx="15" cy="50" r="5" fill="#e6194b" /> <path id="tp-kqi" d="M 45 55 L 245 55"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-kqi">kqi 'merge dev to main'</textPath></text>
  <circle id="p-kqj" cx="30" cy="25" r="5" fill="#3cb44b" /> <path id="tp-kqj" d="M 45 30 L 245 30"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-kqj">kqj 'do something'</textPath></text>
  <circle id="p-bai" cx="30" cy="75" r="5" fill="#3cb44b" /> <path id="tp-bai" d="M 45 80 L 245 80"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-bai">bai 'do something2'</textPath></text>
</svg>`)
})
