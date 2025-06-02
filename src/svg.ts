import type { Commit } from './git.js'
import type { RequiredTheme } from './options.js'

interface Drawable {
  draw: (id: string, theme: Svg['theme']) => string
}
interface Text {
  text: (theme: Svg['theme']) => string
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

type CommitMessage = Text & Drawable & {
  color: string
}
type BranchInfo = Text & Drawable & {
  color: string
}

type Svg = Drawable & {
  id: string
  width: number
  height: number
  theme: RequiredTheme
  commitPoints: Point[]
  commitMessages: CommitMessage[]
  commitLines: Line[]
  mergeLines: MergeLine[]
  branchInfos: BranchInfo[]
  errors: Drawable[]
}

function newPoint(hash: string, x: number, y: number, color: string): Point {
  return {
    x,
    y,
    color,
    draw(id: string, theme: Svg['theme']) {
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

function newCommitMessage(x: number, y: number, color: string, commit: Commit): CommitMessage {
  return {
    color,
    text: (theme: Svg['theme']) => {
      let text = ''
      if (text.length > 0) {
        return text
      }
      if (theme.showHash) {
        text = `${commit.hash}   ${commit.message}`
      }
      if (theme.showDate && commit.date > 0) {
        const date = new Intl.DateTimeFormat(undefined, theme.dateFormat).format(commit.date)
        text = `${text}   ${date}`
      }
      return text
    },
    draw(id: string, theme: Svg['theme']) {
      const commitMessageId = `tp-${id}-${commit.hash}`
      const text = this.text(theme)
      return `<path id="${commitMessageId}" d="M ${x} ${y} L ${x + text.length * theme.charWidth} ${y}"/><text><textPath baseline-shift="-27%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${commitMessageId}">${text}</textPath></text>`
    },
  }
}

function newMergeLine(from: Point, to: Point, color: string): MergeLine {
  return {
    from,
    to,
    color,
    draw(_, theme: Svg['theme']) {
      const flag = Math.abs(this.to.y - this.from.y) > theme.pointSpace
      const x1 = this.from.x
      const y1 = this.to.y > this.from.y ? this.to.y - theme.pointSpace : this.to.y + theme.pointSpace
      const x2 = this.to.x
      const y2 = this.to.y
      return `<path d="M ${this.from.x} ${this.from.y}${flag ? ` ${x1} ${y1}` : ''} C ${0.8 * x1 + 0.2 * x2
      } ${0.2 * y1 + 0.8 * y2} ${0.2 * x1 + 0.8 * x2} ${0.8 * y1 + 0.2 * y2
      } ${x2} ${y2}" stroke="${this.color}" stroke-width="2" fill="none" />`
    },
  }
}

function newBranchInfo(x: number, y: number, name: string, color: string): BranchInfo {
  return {
    color,
    text: () => name,
    draw: (id: string, theme: Svg['theme']) => {
      const point2X = x + theme.lineSpace
      const textPathX = point2X + theme.lineSpace
      const infoId = `bif-${id}-${name}`
      return `<circle cx="${x}" cy="${y}" r="${theme.pointRadius}" fill="${color}" />
      <circle cx="${point2X}" cy="${y}" r="${theme.pointRadius}" fill="${color}" />
      <line x1="${x}" y1="${y}" x2="${point2X}" y2="${y}" stroke="${color}" stroke-width="2" />
      <path id="${infoId}" d="M ${textPathX} ${y} L ${textPathX + name.length * theme.charWidth} ${y}"/>
      <text><textPath baseline-shift="-27%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${infoId}">${name}</textPath></text>`
    },
  }
}

function newDivider(x: number, y: number, len: number, color: string): Drawable {
  return {
    draw() {
      return `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y}" stroke="${color}" stroke-width="1" />`
    },
  }
}

export {
  CommitMessage,
  Drawable,
  Line,
  MergeLine,
  newBranchInfo,
  newCommitMessage,
  newDivider,
  newLine,
  newMergeLine,
  newPoint,
  Point,
  Svg,
}
