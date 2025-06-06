interface Commit {
  hash: string
  message: string
  date: number
  base?: string
  merge?: string
  branch: Branch
}

interface Branch {
  id: number
  name: string
  commits: Commit[]
}

const branchRegex = /^\[.*\]/

function parseBranch(id: number, row: string): Branch | undefined {
  if (branchRegex.test(row)) {
    return {
      id,
      name: row.substring(1, row.indexOf(']')),
      commits: [],
    }
  }
}

function parseCommit(row: string, branch: Branch): Commit | undefined {
  const cells = toCells(row)
  if (cells.length < 2) {
    return
  }
  const commit: Commit = {
    hash: cells[0],
    message: cells[1],
    date: 0,
    branch,
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
  if (commit.hash.trim().length <= 0) {
    return
  }
  // 默认为上一个提交的base
  if (commit.branch.commits.length > 0) {
    commit.branch.commits[commit.branch.commits.length - 1].base = commit.hash
  }
  branch.commits.push(commit)
  return commit
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
      if (flag && i === s) {
        s++
      }
      flag = !flag
      if (flag && i !== s) {
        cells.push(row.substring(s, i))
        s = i + 1
        continue
      }
    }
    if (i === len - 1) {
      if (s <= i) {
        cells.push(row.substring(s, i + 1))
      }
      break
    }
  }
  return cells.map(v => v.trim()).filter(v => v.length > 0)
}

function getBranches(text: string, defaultBranchName: string): Branch[] {
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
    const branch = parseBranch(branches.length, row)
    if (branch !== undefined) {
      branches.push(branch)
      continue
    }
    if (branches.length === 0) {
      branches.push({
        id: 0,
        name: defaultBranchName,
        commits: [],
      })
    }
    const commit = parseCommit(row, branches[branches.length - 1])
    if (commit === undefined) {
      continue
    }
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

export {
  Branch,
  Commit,
  getBranches,
  getSortedCommits,
  parseBranch,
  parseCommit,
}
