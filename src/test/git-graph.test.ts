import MarkdownIt from "markdown-it";
import { expect, test } from "vitest";
import { gitGraphPlugin } from "../plugin";

const md = MarkdownIt().use(gitGraphPlugin);

test("one line", async () => {
  const res = md.render(`\`\`\`git-graph\n
    [main]
    1 kj
    2 jl
    3 jk
    [dev]
    4 ll
    7 lj
    8<3 ukj
    9<4,6 'merge 4 7'
    \`\`\``)
    console.log(res);
    
    expect(res).toBe(`<svg width='175' height='155' xmlns='http://www.w3.org/2000/svg'>
    <path d="M 20 60 C 
      40 76 
      100 64 
      120 80" stroke="#e6194b" stroke-width="2" fill="none" />
<line x1="120" y1="100" x2="120" y2="80" stroke="#3cb44b" stroke-width="2" />
<circle cx="120" cy="100" r="5" fill="#3cb44b" />
<line x1="120" y1="80" x2="120" y2="40" stroke="#3cb44b" stroke-width="2" />
<circle cx="120" cy="80" r="5" fill="#3cb44b" />
<line x1="120" y1="40" x2="120" y2="20" stroke="#3cb44b" stroke-width="2" />
<circle cx="120" cy="40" r="5" fill="#3cb44b" />
<circle cx="120" cy="20" r="5" fill="#3cb44b" />
<line x1="20" y1="60" x2="20" y2="40" stroke="#e6194b" stroke-width="2" />
<circle cx="20" cy="60" r="5" fill="#e6194b" />
<line x1="20" y1="40" x2="20" y2="20" stroke="#e6194b" stroke-width="2" />
<circle cx="20" cy="40" r="5" fill="#e6194b" />
<circle cx="20" cy="20" r="5" fill="#e6194b" />
  </svg>`)
});
