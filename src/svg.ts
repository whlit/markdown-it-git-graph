import type { Commit } from './git.js'
import type { RequiredOptions, RequiredTheme } from './options.js'

interface Drawable {
  draw: (id: string, theme: RequiredTheme) => string
}

type Point = Drawable & {
  x: number
  y: number
  color: string
}
type Line = Drawable & {
  from: Point | { x: number, y: number }
  to: Point
  color: string
}
type MergeLine = Line

type Svg = Drawable & {
  id: string
  width: number
  height: number
  points: Point[]
  lines: Line[]
  mergeLines: MergeLine[]
  errors: Drawable[]
}

function newPoint(hash: string, x: number, y: number, color: string): Point {
  return {
    x,
    y,
    color,
    draw(id: string, theme: RequiredTheme) {
      return `<circle id="p-${id}-${hash}" cx="${this.x}" cy="${this.y}" r="${theme.pointRadius}" fill="${this.color}" />`
    },
  } as Point
}

function newLine(from: Point | { x: number, y: number }, to: Point, color: string): Line {
  return {
    from,
    to,
    color,
    draw() {
      return `<line x1="${this.from.x}" y1="${this.from.y}" x2="${this.to.x}" y2="${this.to.y}" stroke="${this.color}" stroke-width="2" />`
    },
  }
}

function newMergeLine(from: Point, to: Point, color: string): MergeLine {
  return {
    from,
    to,
    color,
    draw(_, theme: RequiredTheme) {
      const flag = Math.abs(this.to.y - this.from.y) > theme.lineHeight
      const x1 = this.from.x
      const y1 = this.to.y > this.from.y ? this.to.y - theme.lineHeight : this.to.y + theme.lineHeight
      const x2 = this.to.x
      const y2 = this.to.y
      return `<path d="M ${this.from.x} ${this.from.y}${flag ? ` ${x1} ${y1}` : ''} C ${0.8 * x1 + 0.2 * x2
      } ${0.2 * y1 + 0.8 * y2} ${0.2 * x1 + 0.8 * x2} ${0.8 * y1 + 0.2 * y2
      } ${x2} ${y2}" stroke="${this.color}" stroke-width="2" fill="none" />`
    },
  }
}

function addToSvg(commits: Commit[], svg: Svg, theme: RequiredTheme): void {
  svg.height = commits.length * theme.lineHeight
  const padding = {
    x: theme.lineWidth / 2,
    y: theme.lineHeight / 2,
  }
  const branchInfoCache: { [key: number]: { color: string, x: number } } = {}
  const points: { [key: string]: Point } = {}
  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i]
    // error: duplicate commit
    if (points[commit.hash]) {
      svg.errors.push({
        draw: () => `commit ${commit.hash} is not uniqued`,
      })
      continue
    }
    let branch = branchInfoCache[commit.branch.id]
    if (!branch) {
      branch = {
        color: commit.branch.id < theme.colors.length ? theme.colors[commit.branch.id] : randomColor(),
        x: commit.branch.id * theme.lineWidth + padding.x,
      }
      branchInfoCache[commit.branch.id] = branch
    }
    // new point
    const point = newPoint(commit.hash, branch.x, i * theme.lineHeight + padding.y, branch.color)
    points[commit.hash] = point
    svg.points.push(point)
  }
  svg.width = (Object.keys(branchInfoCache).length) * theme.lineWidth

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i]
    const point = points[commit.hash]
    // start line
    if (commit.base === undefined && commit.merge === undefined) {
      svg.lines.push(newLine({
        x: point.x,
        y: svg.height - padding.y,
      }, point, point.color))
      continue
    }
    // line
    if (commit.base !== undefined) {
      const basePoint = points[commit.base]
      if (!basePoint) {
        svg.errors.push({
          draw: () => `commit ${commit.hash} base ${commit.base} not found`,
        })
      }
      else {
        svg.lines.push(newLine(basePoint, point, point.color))
      }
    }
    // merge line
    if (commit.merge !== undefined) {
      const mergePoint = points[commit.merge]
      if (!mergePoint) {
        svg.errors.push({
          draw: () => `commit ${commit.hash} merge ${commit.merge} not found`,
        })
      }
      else {
        svg.mergeLines.push(newMergeLine(mergePoint, point, commit.base ? mergePoint.color : point.color))
      }
    }
  }
}

function getSvg(idx: number, commits: Commit[], options: RequiredOptions): Svg {
  const svg: Svg = {
    id: idx.toString(),
    width: 0,
    height: 0,
    points: [],
    lines: [],
    mergeLines: [],
    errors: [],
    draw(_: string, theme: RequiredTheme) {
      if (svg.errors.length > 0) {
        return `<svg width=300 height=100 xmlns='http://www.w3.org/2000/svg'>
        ${svg.errors.map(e => e.draw(this.id, theme)).join('\n')}</svg>`
      }
      return `<svg width='${this.width}' height='${this.height}' xmlns='http://www.w3.org/2000/svg'>${this.mergeLines.map(e => e.draw(this.id, theme)).join('')
      }${this.lines.map(e => e.draw(this.id, theme)).join('')
      }${this.points.map(e => e.draw(this.id, theme)).join('')
      }</svg>`
    },
  }
  addToSvg(commits, svg, options.theme)
  return svg
}

function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export {
  Drawable,
  getSvg,
  Line,
  MergeLine,
  newLine,
  newMergeLine,
  newPoint,
  Point,
  Svg,
}
