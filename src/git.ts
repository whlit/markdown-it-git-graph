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

const branchRegex = /^\[.*\]/

function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

function parseBranch(row: string): Branch | undefined {
  if (branchRegex.test(row)) {
    return {
      name: row.substring(1, row.indexOf(']')),
      color: randomColor(),
      commits: [],
    }
  }
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

export {
  Branch,
  Commit,
  parseBranch,
  parseCommit,
}
