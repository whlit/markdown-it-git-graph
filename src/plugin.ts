import type { PluginWithOptions } from 'markdown-it'
import type { Branch, Commit } from './git.js'
import type { MarkdownItGitGraphOptions } from './options.js'
import type { CommitMessage, Point, Svg } from './svg.js'
import { parseBranch, parseCommit } from './git.js'
import { defaultOptions } from './options.js'
import { newBranchInfo, newCommitMessage, newDivider, newLine, newMergeLine, newPoint } from './svg.js'

const GitGraphPlugin: PluginWithOptions<MarkdownItGitGraphOptions>
  = (md, gitGraphOptions: MarkdownItGitGraphOptions = defaultOptions) => {
    const fence = md.renderer.rules.fence
    md.renderer.rules.fence = (
      tokens,
      idx,
      options,
      env,
      self,
    ) => {
      const token = tokens[idx]
      const language = token.info.trim()

      if (language.startsWith('git-graph')) {
        return getSvg(idx, token.content, gitGraphOptions)
      }
      return fence?.(
        tokens,
        idx,
        options,
        env,
        self,
      ) ?? ''
    }
  }

function getBranches(text: string, options: MarkdownItGitGraphOptions): Branch[] {
  const rows = text
    .replace(/`/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')
  const branches: Branch[] = []
  const commitMap: { [key: string]: Commit } = {}
  for (let row of rows) {
    row = row.replace(/\\s/g, '').trim()
    if (row === '') {
      continue
    }
    const branch = parseBranch(row)
    if (branch) {
      if (branches.length < options.colors.length) {
        branch.color = options.colors[branches.length]
      }
      branches.push(branch)
      continue
    }
    const commit = parseCommit(row)
    if (!commit) {
      continue
    }
    if (branches.length === 0) {
      branches.push({
        name: options.defaultBranchName,
        color: options.colors[0],
        commits: [],
      })
    }
    commit.branch = branches[branches.length - 1]
    // 默认为上一个提交的base
    if (commit.branch.commits.length > 0) {
      commit.branch.commits[commit.branch.commits.length - 1].base = commit.hash
    }
    commit.branch.commits.push(commit)
    commitMap[commit.hash] = commit
  }
  // 以id 排序
  branches.forEach(branch => branch.commits.reverse())
  // 清除不规范的merge
  Object.keys(commitMap).forEach((hash) => {
    const commit = commitMap[hash]
    if (commit.merge && !commitMap[commit.merge]) {
      commit.merge = undefined
    }
  })
  return branches
}

function getSortedCommits(branchs: Branch[]): Commit[] {
  const commitMap: { [key: string]: Commit } = {}
  const commits: Commit[] = []
  const count = branchs.reduce((sum, branch) => sum + branch.commits.length, 0)
  const branchLoopIdxs: number[] = Array.from({
    length: branchs.length,
  }, () => 0)
  while (commits.length < count) {
    let bi: number = -1
    for (let i = 0; i < branchs.length; i++) {
      const branch = branchs[i]
      const j = branchLoopIdxs[i]
      if (j >= branch.commits.length) {
        continue
      }
      if (bi < 0) {
        bi = i
        continue
      }
      const pre = branchs[bi].commits[branchLoopIdxs[bi]]
      // pre 存在 merge 并且 merge 的commit未处理，则优先处理当前
      if (pre.merge && !commitMap[pre.merge]) {
        bi = i
        continue
      }
      const curr = branch.commits[j]
      // 当前存在merge，并且merge的commit未处理，则跳过
      if (curr.merge && !commitMap[curr.merge]) {
        continue
      }
      // 按时间排序
      if (curr.date < pre.date) {
        bi = i
      }
    }
    if (bi < 0) {
      break
    }
    const commit = branchs[bi].commits[branchLoopIdxs[bi]]
    commits.push(commit)
    commitMap[commit.hash] = commit
    branchLoopIdxs[bi]++
  }
  return commits.reverse()
}

function addToSvg(branchs: Branch[], svg: Svg): void {
  const commits = getSortedCommits(branchs)
  const commitOrderMap: { [key: string]: number } = {}
  commits.forEach((commit, index) => {
    commitOrderMap[commit.hash] = index
  })

  const lineSpace = svg.options.lineSpace
  const pointSpace = svg.options.pointSpace
  const padding = {
    x: lineSpace / 2,
    y: pointSpace / 2,
  }
  const labelX = branchs.length * svg.options.lineSpace + padding.x
  const height = (Object.keys(commitOrderMap).length + 1) * svg.options.pointSpace
  svg.height += height
  svg.width = Math.max(svg.width, labelX + svg.options.messageMaxLen + svg.options.lineSpace)

  const mergeCommits: Commit[] = []
  const points: { [key: string]: Point } = {}
  for (let i = 0; i < branchs.length; i++) {
    const branch = branchs[i]
    if (svg.options.drawBranchInfo) {
      svg.branchInfos.push(newBranchInfo(padding.x, height + (i) * pointSpace, branch.name, branch.color))
    }
    const lineX = i * svg.options.lineSpace + padding.x
    for (let j = 0; j < branch.commits.length; j++) {
      const commit = branch.commits[j]
      // error: duplicate commit
      if (points[commit.hash]) {
        svg.errors.push({
          draw: () => `<text x="${lineSpace}" y="${pointSpace}"><tspan font-weight="bold" fill="red">提交记录的hash[${commit.hash}]重复</tspan></text>`,
        })
        continue
      }
      // new point
      const point = newPoint(commit.hash, lineX, commitOrderMap[commit.hash] * pointSpace + padding.y, branch.color)
      svg.commitPoints.push(point)
      points[commit.hash] = point
      // commit message
      const commitMessage: CommitMessage = newCommitMessage(labelX, point.y, branch.color, commit)
      svg.commitMessages.push(commitMessage)
      // commit line
      if (commit.base) {
        svg.commitLines.push(newLine(points[commit.base], point, branch.color))
      }
      // 没有base也没有merge则需要画一条从底到此的线
      else if (!commit.merge) {
        svg.commitLines.push(newLine({
          x: lineX,
          y: height - pointSpace,
        }, point, branch.color))
      }
      // has merge commit
      if (commit.merge) {
        mergeCommits.push(commit)
      }
    }
  }
  // merge line
  mergeCommits.forEach((commit) => {
    const mergeCommit = commit.merge
    if (!mergeCommit || !points[mergeCommit] || !commit.branch) {
      return
    }
    const from = points[mergeCommit]
    const to = points[commit.hash]
    svg.mergeLines.push(newMergeLine(from, to, from.color))
  })
}

function getSvg(idx: number, text: string, gitGraphOptions: MarkdownItGitGraphOptions): string {
  const branchs = getBranches(text, gitGraphOptions)
  const svg: Svg = {
    id: idx.toString(),
    width: 0,
    height: 0,
    options: {
      pointSpace: 25,
      lineSpace: 20,
      pointRadius: 5,
      messageMaxLen: 200,
      drawBranchInfo: true,
    },
    commitMessages: [],
    branchInfos: [],
    commitPoints: [],
    commitLines: [],
    mergeLines: [],
    errors: [],
    draw: (id: string, options: Svg['options']) => {
      if (svg.errors.length > 0) {
        return `<svg width=300 height=100 xmlns='http://www.w3.org/2000/svg'>\n  ${svg.errors.map(e => e.draw(id, options)).join('\n')}\n</svg>`
      }
      let divider = ''
      let branchInfos = ''
      if (options.drawBranchInfo) {
        divider = newDivider(0, svg.height - options.pointSpace * 0.8, svg.width, '#dadce0').draw(id, options)
        svg.height += svg.branchInfos.length * options.pointSpace
        branchInfos = svg.branchInfos.map(e => e.draw(svg.id, svg.options).trim()).filter(e => e.length > 0).join('\n')
      }
      return `<svg width='${svg.width}' height='${svg.height}' xmlns='http://www.w3.org/2000/svg'>
      ${svg.mergeLines.map(e => e.draw(id, options)).join('\n')}
      ${svg.commitLines.map(e => e.draw(id, options)).join('\n')}
      ${svg.commitPoints.map(e => e.draw(id, options)).join('\n')}
      ${svg.commitMessages.map(e => e.draw(id, options)).join('\n')}
      ${svg.branchInfos.map(e => e.draw(id, options).trim()).filter(e => e.length > 0).join('\n')}
      ${divider}${branchInfos}
      </svg>`
    },
  }
  addToSvg(branchs, svg)
  return svg.draw(svg.id, svg.options)
}

export {
  getBranches,
  getSortedCommits,
  getSvg,
  GitGraphPlugin,
}
