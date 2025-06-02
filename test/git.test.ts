import type { MarkdownItGitGraphOptions } from '../options'
import { expect, it } from 'vitest'
import { parseCommit } from '../git'
import { getOptions } from '../options'
import { getBranches } from '../plugin'

function branchesTester(text: string, options?: MarkdownItGitGraphOptions) {
  const branches = getBranches(text, getOptions(options))
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
      expect(branches.reduce((pre, curr) => pre + curr.commits.length, 0)).toBe(len)
      return expects
    },
    branchCommitSizeToBe: (name: string, len: number) => {
      expect(branches.find(b => b.name === name)?.commits.length).toBe(len)
      return expects
    },
  }
  return expects
}

function commitTester(text: string) {
  const commit = parseCommit(text)
  const expects = {
    isUndefined: () => {
      expect(commit).toBeUndefined()
    },
    hashToBe: (hash: string) => {
      expect(commit?.hash).toBe(hash)
      return expects
    },
    messageToBe: (message: string) => {
      expect(commit?.message).toBe(message)
      return expects
    },
    dateToBe: (date: number) => {
      expect(commit?.date).toBe(date)
      return expects
    },
    mergeToBe: (merge?: string) => {
      expect(commit?.merge).toBe(merge)
      return expects
    },
  }
  return expects
}

it('branch-simple', async () => {
  const tester = (text: string, name: string, size: number = 1) => {
    const t = branchesTester(text).branchSizeToBe(size)
    if (size < 1) {
      return
    }
    t.branchNameContains(name)
  }
  // 标准main
  tester('[main]', 'main')
  // 自定义名称
  tester('[kjkj]', 'kjkj')
  // 无名称, 同时也不符合commit格式
  tester('kjkj', '', 0)
  // 特殊
  tester('[main] [kjkj]', 'main', 1)
  tester('[main]jkj]', 'main', 1)
  tester('[main[jkj]', 'main[jkj', 1)
  tester('[ma<in>[>jkj]', 'ma<in>[>jkj', 1)
})

it('commit-simple', async () => {
  const tester = (text: string, hash: string, message: string, date: number) => {
    commitTester(text)
      .hashToBe(hash)
      .messageToBe(message)
      .dateToBe(date)
  }
  // 标准
  tester('1 k', '1', 'k', 0)
  tester('fsdf afsdk', 'fsdf', 'afsdk', 0)

  // 带引号
  tester(`1 'k'`, '1', 'k', 0)
  tester('1 "k"', '1', '"k"', 0)
  tester(`'1' k`, '1', 'k', 0)
  tester(`"1" k`, '"1"', 'k', 0)

  // 单引号为奇数
  commitTester(`'1 k`).isUndefined()
  commitTester(`'1  k 2020-01-01`).isUndefined()
  commitTester(`'1  k 2020-01-01''`).isUndefined()
  commitTester(`'1  k 2020-01-01' '`).isUndefined()
  commitTester(`'1  k 2020-01-01' '   `).isUndefined()
  tester(`'1  k 2020-01-01' ' df  `, '1  k 2020-01-01', 'df', 0)
  tester(`'1  k 2020-01-01'' df  `, '1  k 2020-01-01', 'df', 0)

  // 指定时间
  tester('1  k 8', '1', 'k', Date.parse('8'))
  tester('1  k a', '1', 'k', 0)
  tester('1  k 2020-01-01', '1', 'k', Date.parse('2020-01-01'))
  tester('1  k 2020/01/01', '1', 'k', Date.parse('2020/01/01'))
})

it('commit-merge', async () => {
  const tester = (text: string, hash: string, merge?: string) => {
    commitTester(text)
      .hashToBe(hash)
      .mergeToBe(merge)
  }

  // 标准
  tester('1  k', '1')
  tester('1<2  k', '1', '2')

  // 其他
  tester('1<2<3  k', '1', '2')
  tester('1<2>  k', '1', '2')
  tester(`'1< ' k`, '1')
  tester(`'1<>fdf' k`, '1')
  tester(`'1<a>fdf' k`, '1', 'a')
  tester(`'1<><fdf' k`, '1')
})
