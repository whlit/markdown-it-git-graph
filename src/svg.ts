import type { Commit } from './git.js'

interface Drawable {
  draw: (id: string, options: Svg['options']) => string
}
interface Text {
  text: (options: Svg['options']) => string
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
  options: {
    pointSpace: number
    lineSpace: number
    pointRadius: number
    messageMaxLen: number
    showBranchInfo: boolean
    showHash: boolean
    showDate: boolean
    dateFormat: Intl.DateTimeFormatOptions
    charWidth: number
  }
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
    draw(id: string, options: Svg['options']) {
      return `<circle id="p-${id}-${hash}" cx="${this.x}" cy="${this.y}" r="${options.pointRadius}" fill="${this.color}" />`
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
    text: (options: Svg['options']) => {
      let text = ''
      if (text.length > 0) {
        return text
      }
      if (options.showHash) {
        text = `${commit.hash}   ${commit.message}`
      }
      if (options.showDate && commit.date > 0) {
        const date = new Intl.DateTimeFormat(undefined, options.dateFormat).format(commit.date)
        text = `${text}   ${date}`
      }
      return text
    },
    draw(id: string, options: Svg['options']) {
      const commitMessageId = `tp-${id}-${commit.hash}`
      const text = this.text(options)
      return `<path id="${commitMessageId}" d="M ${x} ${y} L ${x + text.length * options.charWidth} ${y}"/><text><textPath baseline-shift="-27%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${commitMessageId}">${text}</textPath></text>`
    },
  }
}

function newMergeLine(from: Point, to: Point, color: string): MergeLine {
  return {
    from,
    to,
    color,
    draw(_, options: Svg['options']) {
      const flag = Math.abs(this.to.y - this.from.y) > options.pointSpace
      const x1 = this.from.x
      const y1 = this.to.y > this.from.y ? this.to.y - options.pointSpace : this.to.y + options.pointSpace
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
    draw: (id: string, options: Svg['options']) => {
      const point2X = x + options.lineSpace
      const textPathX = point2X + options.lineSpace
      const infoId = `bif-${id}-${name}`
      return `<circle cx="${x}" cy="${y}" r="${options.pointRadius}" fill="${color}" />
      <circle cx="${point2X}" cy="${y}" r="${options.pointRadius}" fill="${color}" />
      <line x1="${x}" y1="${y}" x2="${point2X}" y2="${y}" stroke="${color}" stroke-width="2" />
      <path id="${infoId}" d="M ${textPathX} ${y} L ${textPathX + name.length * options.charWidth} ${y}"/>
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
