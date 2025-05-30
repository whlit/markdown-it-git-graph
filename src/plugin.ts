import type { PluginWithOptions } from 'markdown-it'
import type { MarkdownItGitGraphOptions } from './options'

const gitGraphPlugin: PluginWithOptions<MarkdownItGitGraphOptions>
  = (md, gitGraphOptions?: MarkdownItGitGraphOptions) => {
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

interface Commit {
  hash: string
  message: string
  date: number
  base?: string
  merge?: string
  branch?: Branch
}

interface Branch {
  name: string
  color: string
  commits: Commit[]
}

const branchRegex = /^\[.*\]$/

const colors: string[] = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#fabebe',
  '#008080',
  '#e6beff',
]

function getBranches(text: string, options?: MarkdownItGitGraphOptions): Branch[] {
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
    if (branchRegex.test(row)) {
      branches.push({
        name: row.substring(1, row.length - 1),
        color:
          branches.length < colors.length
            ? colors[branches.length]
            : randomColor(),
        commits: [],
      })
      continue
    }
    const commit = parseCommit(row)
    if (!commit) {
      continue
    }
    if (branches.length === 0) {
      branches.push({
        name: options?.defaultBranchName ?? 'main',
        color: colors[0],
        commits: [],
      })
    }
    commit.branch = branches[branches.length - 1]
    // 默认为上一个提交为base
    if (commit.branch.commits.length > 0) {
      commit.base = commit.branch.commits[commit.branch.commits.length - 1].hash
    }
    commit.branch.commits.push(commit)
    commitMap[commit.hash] = commit
  }
  // 清除不规范的merge
  Object.keys(commitMap).forEach((hash) => {
    const commit = commitMap[hash]
    if (commit.merge && !commitMap[commit.merge]) {
      commit.merge = undefined
    }
  })
  return branches
}

function parseCommit(row: string): Commit | undefined {
  const cells = toCells(row)
  if (cells.length < 2) {
    return
  }
  const commit: Commit = {
    hash: cells[0],
    message: cells[1],
    date: 0,
  }
  if (cells.length > 2) {
    const date = Date.parse(cells[2])
    commit.date = Number.isNaN(date) ? 0 : date
  }
  if (commit.hash.includes('<')) {
    const strs = commit.hash.split('<')
    if (strs.length < 2) {
      return
    }
    commit.hash = strs[0]
    if (strs[1].includes('>')) {
      strs[1] = strs[1].split('>')[0]?.trim()
    }
    commit.merge = strs[1] && strs[1].length > 0 ? strs[1] : undefined
  }
  return commit.hash.trim().length > 0 ? commit : undefined
}

function toCells(row: string): string[] {
  const cells: string[] = []
  let flag = true
  for (let i = 0, s = 0, len = row.length; i < len; i++) {
    if (row[i] === ' ' && flag) {
      if (i === s) {
        s++
        continue
      }
      cells.push(row.slice(s, i))
      s = i + 1
      continue
    }
    if (row[i] === '\'') {
      flag = !flag
    }
    if (i === len - 1) {
      if (s <= i) {
        cells.push(row.substring(s, i + 1))
      }
      break
    }
  }
  return cells
}

interface Drawable {
  draw: () => string
}

type Point = Drawable & {
  x: number
  y: number
  color: string
}

type Line = Drawable

function parse(idx: number, branchs: Branch[], pointSpace = 25, lineSpace = 25): Drawable[] {
  const drawables: Drawable[] = []

  const commits: Commit[] = getSortedCommits(branchs)
  const height = (commits.length + 1) * pointSpace

  const points: { [key: string]: Point } = {}
  const lines: Line[] = []
  const mergeCommits = []
  const labelX = (branchs.length + 1) * lineSpace
  for (let i = 0; i < branchs.length; i++) {
    const branch = branchs[i]
    for (let j = 0; j < branch.commits.length; j++) {
      const commit = branch.commits[j]
      // error: duplicate commit
      if (points[commit.hash]) {
        return [{
          draw: () => `<text x="${lineSpace}" y="${pointSpace}"><tspan font-weight="bold" fill="red">提交记录的hash[${commit.hash}]重复</tspan></text><text x="${lineSpace}" y="${pointSpace + pointSpace}"><tspan font-weight="bold" fill="red">The commit hash[${commit.hash}] is repeated</tspan></text>`,
        }]
      }
      // new point
      points[commit.hash] = newPoint(
        idx,
        branch.color,
        commit,
        (i + 1) * lineSpace,
        height - (commits.indexOf(commit) + 1) * pointSpace,
        labelX,
      )
      const point = points[commit.hash]
      // commit line
      if (j > 0) {
        lines.push(newLine(points[branch.commits[j - 1].hash], point, branch.color))
      }
      else if (!commit.merge) {
        lines.push(newLine({
          x: point.x,
          y: height - pointSpace / 2,
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
    lines.push(newMergeLine(from, to, from.color, pointSpace))
  })
  drawables.push(...lines)
  drawables.push(...Object.keys(points).map(hash => points[hash]))
  return drawables
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
  return commits
}

function newMergeLine(from: Point, to: Point, color: string, pointSpace: number): Line {
  return {
    draw() {
      const flag = Math.abs(to.y - from.y) > pointSpace
      const x1 = from.x
      const y1 = to.y > from.y ? to.y - pointSpace : to.y + pointSpace
      const x2 = to.x
      const y2 = to.y
      return `<path d="M ${from.x} ${from.y}${flag ? ` ${x1} ${y1}` : ''} C ${0.8 * x1 + 0.2 * x2
      } ${0.2 * y1 + 0.8 * y2} ${0.2 * x1 + 0.8 * x2} ${0.8 * y1 + 0.2 * y2
      } ${x2} ${y2}" stroke="${color}" stroke-width="2" fill="none" />`
    },
  }
}

function newLine(from: Point | { x: number, y: number }, to: Point, color: string): Line {
  return {
    draw() {
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${color}" stroke-width="2" />`
    },
  }
}

function newPoint(
  idx: number,
  color: string,
  commit: Commit,
  x: number,
  y: number,
  labelX: number,
): Point {
  const id = `${idx}-${commit.hash}`
  return {
    x,
    y,
    color,
    draw() {
      return `${circleOfPoint(
        commit.hash,
        this.x,
        this.y,
        5,
        this.color,
      )} ${textPathOfPoint(id, labelX, y + 5, 200)} ${textOfPoint(id, commit)}`
    },
  }
}

function circleOfPoint(
  id: string,
  x: number,
  y: number,
  r: number,
  color: string,
): string {
  return `<circle id="p-${id}" cx="${x}" cy="${y}" r="${r}" fill="${color}" />`
}

function textPathOfPoint(id: string, x: number, y: number, len: number): string {
  return `<path id="tp-${id}" d="M ${x} ${y} L ${x + len} ${y}"/>`
}

function textOfPoint(id: string, commit: Commit): string {
  return `<text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-${id}">${commit.hash} ${commit.message}</textPath></text>`
}

function getSvg(idx: number, text: string, options?: MarkdownItGitGraphOptions): string {
  const branchs = getBranches(text, options)
  const drawables = parse(idx, branchs, 25, 15)
  const commitSize = branchs.reduce((pre, curr) => pre + curr.commits.length, 0)
  return `<svg width='${branchs.length * 25 + 300}' height='${commitSize * 25 + 25
  }' xmlns='http://www.w3.org/2000/svg'>\n  ${drawables
    .map(d => d.draw())
    .join('\n  ')}\n</svg>`
}

function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export {
  getBranches,
  getSortedCommits,
  getSvg,
  gitGraphPlugin,
}
