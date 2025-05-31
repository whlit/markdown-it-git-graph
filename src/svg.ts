import type { Commit } from './git.js'

interface Drawable {
  draw: (id: string, options: Svg['options']) => string
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
type CommitMessage = Drawable & {
  text: string
  color: string
}
type BranchInfo = Drawable & {
  name: string
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
    drawBranchInfo: boolean
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
    draw: (id: string, options: Svg['options']) => `<circle id="p-${id}-${hash}" cx="${x}" cy="${y}" r="${options.pointRadius}" fill="${color}" />`,
  }
}

function newLine(from: Point | { x: number, y: number }, to: Point, color: string): Line {
  return {
    from,
    to,
    color,
    draw: () => {
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${color}" stroke-width="2" />`
    },
  }
}

function newCommitMessage(x: number, y: number, color: string, commit: Commit): CommitMessage {
  return {
    text: commit.message,
    color,
    draw: (id: string, options: Svg['options']) => {
      const commitMessageId = `tp-${id}-${commit.hash}`
      return `<path id="${commitMessageId}" d="M ${x} ${y} L ${x + options.messageMaxLen} ${y}"/><text><textPath baseline-shift="-27%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${commitMessageId}">${commit.hash} ${commit.message}</textPath></text>`
    },
  }
}

function newMergeLine(from: Point, to: Point, color: string): MergeLine {
  return {
    from,
    to,
    color,
    draw(id: string, options: Svg['options']) {
      const flag = Math.abs(to.y - from.y) > options.pointSpace
      const x1 = from.x
      const y1 = to.y > from.y ? to.y - options.pointSpace : to.y + options.pointSpace
      const x2 = to.x
      const y2 = to.y
      return `<path d="M ${from.x} ${from.y}${flag ? ` ${x1} ${y1}` : ''} C ${0.8 * x1 + 0.2 * x2
      } ${0.2 * y1 + 0.8 * y2} ${0.2 * x1 + 0.8 * x2} ${0.8 * y1 + 0.2 * y2
      } ${x2} ${y2}" stroke="${color}" stroke-width="2" fill="none" />`
    },
  }
}

function newBranchInfo(x: number, y: number, name: string, color: string): BranchInfo {
  return {
    name,
    color,
    draw: (id: string, options: Svg['options']) => {
      const x2 = x + options.lineSpace
      const infoId = `bif-${id}-${name}`
      return `<circle cx="${x}" cy="${y}" r="${options.pointRadius}" fill="${color}" />
      <circle cx="${x2}" cy="${y}" r="${options.pointRadius}" fill="${color}" />
      <line x1="${x}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="2" />
      <path id="${infoId}" d="M ${x2 + options.lineSpace} ${y} L ${x + options.messageMaxLen} ${y}"/>
      <text><textPath baseline-shift="-27%" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${infoId}">${name}</textPath></text>`
    },
  }
}

function newDivider(x: number, y: number, len: number, color: string): Drawable {
  return {
    draw: () => {
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
