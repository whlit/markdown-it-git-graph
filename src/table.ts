import type { Branch, Commit } from './git'
import type { Column, RequiredOptions } from './options'
import type { Drawable, Svg } from './svg'
import { getSortedCommits } from './git'
import { getSvg } from './svg'

type Table = Drawable & {
  columns: Column[]
  commits: Commit[]
  svg: Svg
}

function getTable(idx: number, branchs: Branch[], options: RequiredOptions): Table {
  const commits = getSortedCommits(branchs)
  return {
    columns: options.theme.columns,
    commits,
    svg: getSvg(idx, commits, options),
    draw(id, theme) {
      return `<table class="gg-table"><tbody><tr class="gg-td-svg"><td rowSpan="99999">${this.svg.draw(id, theme)
      }</td></tr>${this.commits.map(commit => `<tr>${this.columns.map((column) => {
        switch (column) {
          case 'hash':
            return `<td>${commit.hash}</td>`
          case 'message':
            return `<td>${commit.message}</td>`
          case 'date':
            return `<td>${new Intl.DateTimeFormat('default', options.theme.dateFormat).format(commit.date)}</td>`
          default:
            return ''
        }
      }).join('')
      }</tr>`).join('')
      }</tbody></table>`
    },
  }
}

export { getTable }
