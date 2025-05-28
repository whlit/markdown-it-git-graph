import { PluginWithOptions } from "markdown-it";
import { MarkdownItGitGraphOptions } from "./options";
import { L } from "vitest/dist/chunks/reporters.d.C-cu31ET";

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
  if (cells.length < 1) {
    return;
  }
  const commit: Commit = {
    hash: cells[0],
    message: cells[1],
  };
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
  x1: () => number;
  y1: () => number;
  x2: () => number;
  y2: () => number;
}

type Point = Drawable & {
  x: () => number;
  y: () => number;
  label: string;
  color: string;
};

type Line = Drawable & {
  from: Point;
  to: Point;
  color: string;
};

function parse(
  branchs: Branch[],
  pointSpace = 20,
  lineSpace = 100
): Drawable[] {
  const drawables: Drawable[] = [];

  const points: { [key: string]: Point } = {};
  const mergeCommits = [];
  for (let i = 0; i < branchs.length; i++) {
    const branch = branchs[i];
    for (let j = 0; j < branch.commits.length; j++) {
      const commit = branch.commits[j];
      if (commit.merge) {
        mergeCommits.push(commit);
      }
      points[commit.hash] = newPoint(
        branch,
        commit,
        i * lineSpace + 20,
        pointSpace,
        j > 0 ? points[branch.commits[j - 1].hash] : undefined
      );
      drawables.push(points[commit.hash]);
      if (j > 0) {
        drawables.push(
          newLine(
            points[commit.hash],
            points[branch.commits[j - 1].hash],
            branch.color
          )
        );
      }
    }
  }
  mergeCommits.forEach((commit) => {
    const mergeCommit = commit.merge;
    if (!mergeCommit || !points[mergeCommit] || !commit.branch) {
      return;
    }
    drawables.push(newMergeLine(points[mergeCommit], points[commit.hash], points[mergeCommit].color))
    const y = points[commit.hash].y();
    points[commit.hash].y = () =>
      Math.max(y, points[mergeCommit].y()) + pointSpace;
  });
  return drawables.reverse();
}

function newMergeLine(
  from: Point,
  to: Point,
  color: string,
): Line {

  return {
    from: from,
    to: to,
    color: color,
    draw: function () {
      const x1 = from.x();
      const y1 = from.y();
      const x2 = to.x();
      const y2 = to.y();
      return `<path d="M ${x1} ${y1} C 
      ${0.8 * x1 + 0.2 * x2} ${0.2 * y1 + 0.8 * y2} 
      ${0.2 * x1 + 0.8 * x2} ${0.8 * y1 + 0.2 * y2} 
      ${x2} ${y2}" stroke="${this.color}" stroke-width="2" fill="none" />`;
    },
    x1: function () {
      return Math.min(this.from.x(), this.to.x()) - 2;
    },
    x2: function () {
      return Math.max(this.from.x(), this.to.x()) + 2;
    },
    y1: function () {
      return Math.min(this.from.y(), this.to.y()) - 2;
    },
    y2: function () {
      return Math.max(this.from.y(), this.to.y()) + 2;
    },
  };
}

function newLine(from: Point, to: Point, color: string): Line {
  return {
    from: from,
    to: to,
    color: color,
    draw: function () {
      return `<line x1="${this.from.x()}" y1="${this.from.y()}" x2="${this.to.x()}" y2="${this.to.y()}" stroke="${
        this.color
      }" stroke-width="2" />`;
    },
    x1: function () {
      return Math.min(this.from.x(), this.to.x()) - 2;
    },
    x2: function () {
      return Math.max(this.from.x(), this.to.x()) + 2;
    },
    y1: function () {
      return Math.min(this.from.y(), this.to.y()) - 2;
    },
    y2: function () {
      return Math.max(this.from.y(), this.to.y()) + 2;
    },
  };
}

function newPoint(
  branch: Branch,
  commit: Commit,
  branchX: number,
  pointSpace: number,
  base?: Point
): Point {
  return {
    x: () => branchX,
    y: () => (base ? base.y() + pointSpace : pointSpace),
    label: commit.message,
    color: branch.color,
    draw: function () {
      return `<circle cx="${this.x()}" cy="${this.y()}" r="5" fill="${
        this.color
      }" />`;
    },
    x1: function () {
      return this.x() - 5;
    },
    x2: function () {
      return this.x() + 5;
    },
    y1: function () {
      return this.y() - 5;
    },
    y2: function () {
      return this.y() + 5;
    },
  };
}

function getSvg(test: string): string {
  const branchs = getBranches(test);
  const drawables = parse(branchs);

  return `<svg width='${
    Math.max(...drawables.map((d) => d.x2())) + 50
  }' height='${
    Math.max(...drawables.map((d) => d.y2())) + 50
  }' xmlns='http://www.w3.org/2000/svg'>
    ${drawables.map((d) => d.draw()).join("\n")}
  </svg>`;
}

function randomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
