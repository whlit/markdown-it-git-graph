import { PluginWithOptions } from "markdown-it";
import { MarkdownItGitGraphOptions } from "./options";

export const gitGraphPlugin: PluginWithOptions<MarkdownItGitGraphOptions> = (
  md,
  options
) => {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const language = token.info.trim();

    if (language.startsWith("git-graph")) {
      return getSvg(token.content);
    }
    return fence?.(tokens, idx, options, env, self) ?? "";
  };
};

type Commit = {
  hash: string;
  message: string;
  date: number;
  merge?: string;
  branch?: Branch;
};

type Branch = {
  name: string;
  color: string;
  commits: Commit[];
};

const branchRegex = /^\[(.*)\]$/;

const colors: string[] = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
];

function getBranches(text: string): Branch[] {
  const rows = text
    .replace(/\`/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n");
  const branches: Branch[] = [];
  for (let row of rows) {
    row = row.replace(/\\s/g, "").trim();
    if (row === "") {
      continue;
    }
    if (branchRegex.test(row)) {
      branches.push({
        name: row.substring(1, row.length - 1),
        color:
          branches.length < colors.length
            ? colors[branches.length]
            : randomColor(),
        commits: [],
      });
      continue;
    }
    const commit = parseCommit(row);
    if (!commit) {
      continue;
    }
    commit.branch = branches[branches.length - 1];
    branches[branches.length - 1].commits.push(commit);
  }
  return branches;
}

function parseCommit(row: string): Commit | undefined {
  const cells = getCells(row);
  if (cells.length < 2) {
    return;
  }
  const commit: Commit = {
    hash: cells[0],
    message: cells[1],
    date: 0,
  };
  if (cells.length > 2) {
    const date = Date.parse(cells[2]);
    commit.date = isNaN(date) ? 0 : date;
  }
  if (commit.hash.includes("<")) {
    const strs = commit.hash.split("<");
    if (strs.length < 2) {
      return;
    }
    commit.hash = strs[0];
    if (strs[1].includes(">")) {
      strs[1] = strs[1].split(">")[0];
    }
    commit.merge = strs[1];
  }
  return commit;
}

function getCells(row: string): string[] {
  const cells: string[] = [];
  let flag = true;
  for (let i = 0, s = 0, len = row.length; i < len; i++) {
    if (row[i] === " " && flag) {
      if (i == s) {
        s++;
        continue;
      }
      cells.push(row.slice(s, i));
      s = i + 1;
      continue;
    }
    if (row[i] === "'") {
      flag = !flag;
    }
    if (i == len - 1) {
      if (s < i) {
        cells.push(row.substring(s, i + 1));
      }
      break;
    }
  }
  return cells;
}

interface Drawable {
  draw: () => string;
}

type Point = Drawable & {
  x: number;
  y: number;
  color: string;
};

type Line = Drawable;

function parse(branchs: Branch[], pointSpace = 25, lineSpace = 25): Drawable[] {
  const drawables: Drawable[] = [];

  const commits: Commit[] = [];
  branchs.forEach((branch) => commits.push(...branch.commits));
  commits.sort((a, b) => (a.merge && a.merge === b.hash ? 1 : a.date - b.date));
  const height = (commits.length + 1) * pointSpace;

  const points: { [key: string]: Point } = {};
  const lines: Line[] = [];
  const mergeCommits = [];
  const labelX = (branchs.length + 1) * lineSpace;
  for (let i = 0; i < branchs.length; i++) {
    const branch = branchs[i];
    for (let j = 0; j < branch.commits.length; j++) {
      const commit = branch.commits[j];

      points[commit.hash] = newPoint(
        branch.color,
        commit,
        (i + 1) * lineSpace,
        height - (commits.indexOf(commit) + 1) * pointSpace,
        labelX
      );
      const point = points[commit.hash];
      if (j > 0) {
        lines.push(
          newLine(points[branch.commits[j - 1].hash], point, branch.color)
        );
      } else if (!commit.merge) {
        lines.push(
          newLine(
            { x: point.x, y: height - pointSpace / 2 },
            point,
            branch.color
          )
        );
      }

      if (commit.merge) {
        mergeCommits.push(commit);
      }
    }
  }
  mergeCommits.forEach((commit) => {
    const mergeCommit = commit.merge;
    if (!mergeCommit || !points[mergeCommit] || !commit.branch) {
      return;
    }
    const from = points[mergeCommit];
    const to = points[commit.hash];
    lines.push(newMergeLine(from, to, from.color, pointSpace));
  });
  drawables.push(...lines);
  drawables.push(...Object.keys(points).map((hash) => points[hash]));
  return drawables;
}

function newMergeLine(
  from: Point,
  to: Point,
  color: string,
  pointSpace: number
): Line {
  return {
    draw: function () {
      const flag = Math.abs(to.y - from.y) > pointSpace;
      const x1 = from.x;
      const y1 = to.y > from.y ? to.y - pointSpace : to.y + pointSpace;
      const x2 = to.x;
      const y2 = to.y;
      return `<path d="M ${from.x} ${from.y}${flag ? ` ${x1} ${y1}` : ""} C ${
        0.8 * x1 + 0.2 * x2
      } ${0.2 * y1 + 0.8 * y2} ${0.2 * x1 + 0.8 * x2} ${
        0.8 * y1 + 0.2 * y2
      } ${x2} ${y2}" stroke="${color}" stroke-width="2" fill="none" />`;
    },
  };
}

function newLine(
  from: Point | { x: number; y: number },
  to: Point,
  color: string
): Line {
  return {
    draw: function () {
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${color}" stroke-width="2" />`;
    },
  };
}

function newPoint(
  color: string,
  commit: Commit,
  x: number,
  y: number,
  labelX: number
): Point {
  return {
    x,
    y,
    color,
    draw: function () {
      return `${circleOfPoint(
        commit.hash,
        this.x,
        this.y,
        5,
        this.color
      )} ${textPathOfPoint(commit.hash, labelX, y + 5, 200)} ${textOfPoint(
        commit.hash,
        commit.message
      )}`;
    },
  };
}

function circleOfPoint(
  id: string,
  x: number,
  y: number,
  r: number,
  color: string
) {
  return `<circle id="p-${id}" cx="${x}" cy="${y}" r="${r}" fill="${color}" />`;
}

function textPathOfPoint(id: string, x: number, y: number, len: number) {
  return `<path id="tp-${id}" d="M ${x} ${y} L ${x + len} ${y}"/>`;
}

function textOfPoint(id: string, text: string) {
  return `<text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-${id}">${text}</textPath></text>`;
}

function getSvg(text: string): string {
  const branchs = getBranches(text);
  const drawables = parse(branchs, 25, 15);
  const commitSize = branchs.reduce(
    (pre, curr) => pre + curr.commits.length,
    0
  );
  return `<svg width='${branchs.length * 25 + 300}' height='${
    commitSize * 25 + 25
  }' xmlns='http://www.w3.org/2000/svg'>\n  ${drawables
    .map((d) => d.draw())
    .join("\n  ")}\n</svg>`;
}

function randomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
