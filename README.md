# markdown-it-git-graph

一个`markdown-it`插件，用于在 markdown 文档中插入 `git graph`

## 安装

```bash
npm install markdown-it-git-graph
```

## 使用

```ts
import MarkdownIt from 'markdown-it'
import { gitGraphPlugin } from '../plugin'

const md = new MarkdownIt()
  .use(gitGraphPlugin)

const svg = md.render(`\`\`\`git-graph
[main]
abc sonmething
bbc 'do something'
kqi<bai 'merge dev to main'
[dev]
kqj 'do something' 2
bai 'do something2'
\`\`\``)
```

使用` ```git-graph `标注代码块，然后再代码块中，上面的结果示例：

<svg width='350' height='150' xmlns='http://www.w3.org/2000/svg'>
  <line x1="15" y1="137.5" x2="15" y2="125" stroke="#e6194b" stroke-width="2" />
  <line x1="15" y1="125" x2="15" y2="100" stroke="#e6194b" stroke-width="2" />
  <line x1="15" y1="100" x2="15" y2="25" stroke="#e6194b" stroke-width="2" />
  <line x1="30" y1="137.5" x2="30" y2="75" stroke="#3cb44b" stroke-width="2" />
  <line x1="30" y1="75" x2="30" y2="50" stroke="#3cb44b" stroke-width="2" />
  <path d="M 30 50 C 27 30 18 45 15 25" stroke="#3cb44b" stroke-width="2" fill="none" />
  <circle id="p-abc" cx="15" cy="125" r="5" fill="#e6194b" /> <path id="tp-0-abc" d="M 45 130 L 245 130"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-abc">abc sonmething</textPath></text>
  <circle id="p-bbc" cx="15" cy="100" r="5" fill="#e6194b" /> <path id="tp-0-bbc" d="M 45 105 L 245 105"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-bbc">bbc 'do something'</textPath></text>
  <circle id="p-kqi" cx="15" cy="25" r="5" fill="#e6194b" /> <path id="tp-0-kqi" d="M 45 30 L 245 30"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-kqi">kqi 'merge dev to main'</textPath></text>
  <circle id="p-kqj" cx="30" cy="75" r="5" fill="#3cb44b" /> <path id="tp-0-kqj" d="M 45 80 L 245 80"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-kqj">kqj 'do something'</textPath></text>
  <circle id="p-bai" cx="30" cy="50" r="5" fill="#3cb44b" /> <path id="tp-0-bai" d="M 45 55 L 245 55"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-bai">bai 'do something2'</textPath></text>
</svg>

### 分支

使用中括号指定分支名称，若不指定默认名称为 `main`，分支名称占一行，commit信息需要另起一行。

```git-graph
[main]
commit1 something
[dev]
commit2 something
```

### 提交

提交信息分三段，以空格分隔。第一段为提交hash值，或者唯一id，第二段为提交信息，第三段为提交时间，时间可以不添加，默认为0。

- hash: 提交的hash值，或者当前代码块内唯一id，字符串类型，如果需要包含空格需要将整个hash段用单引号包裹。

- message: 提交的信息，字符串类型，如果需要包含空格需要将整个message段用引号包裹。

- time: 提交的时间，毫秒值，整数，或者可以通过`Date.parse('2025-05-24')`解析的时间格式，默认为0。

```git-graph
commit1 'this is a commit message' 78968
commit2 'this is a commit message' 2025-05-24
```

### 合并记录

在`hash`段指定合并记录，格式为`hash1<hash2`，表示`hash1`所在的分支合并了`hash2`。 例如：下面的示例中，`mai`分支合并了`dev`分支的代码，创建了`kqi`这个合并记录。同时也表示`kqi`是由`bbc`和`bai`两个提交合并而来的。结果展示如上面的图所示。

```git-graph
[main]
abc sonmething
bbc 'do something'
kqi<bai 'merge dev to main'
[dev]
kqj 'do something' 2
bai 'do something2'
```

### 新建分支

新建分支，并在新分支上提交一个提交记录，那么这个提交记录我们可以看作是上游分支与空分支的合并的结果，所以格式和合并记录一样，`hash1<hash2`。例如：下面的示例中`dev`分支从`main`分支的`bbc`提交记录创建。

```git-graph
[main]
abc sonmething
bbc 'do something'
kqi 'merge dev to main'
[dev]
kqj<bbc 'do something' 2
bai 'do something2'
```

<svg width='350' height='150' xmlns='http://www.w3.org/2000/svg'>
  <line x1="15" y1="137.5" x2="15" y2="125" stroke="#e6194b" stroke-width="2" />
  <line x1="15" y1="125" x2="15" y2="100" stroke="#e6194b" stroke-width="2" />
  <line x1="15" y1="100" x2="15" y2="75" stroke="#e6194b" stroke-width="2" />
  <line x1="30" y1="50" x2="30" y2="25" stroke="#3cb44b" stroke-width="2" />
  <path d="M 15 100 15 75 C 18 55 27 70 30 50" stroke="#e6194b" stroke-width="2" fill="none" />
  <circle id="p-abc" cx="15" cy="125" r="5" fill="#e6194b" /> <path id="tp-0-abc" d="M 45 130 L 245 130"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-abc">abc sonmething</textPath></text>
  <circle id="p-bbc" cx="15" cy="100" r="5" fill="#e6194b" /> <path id="tp-0-bbc" d="M 45 105 L 245 105"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-bbc">bbc 'do something'</textPath></text>
  <circle id="p-kqi" cx="15" cy="75" r="5" fill="#e6194b" /> <path id="tp-0-kqi" d="M 45 80 L 245 80"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-kqi">kqi 'merge dev to main'</textPath></text>
  <circle id="p-kqj" cx="30" cy="50" r="5" fill="#3cb44b" /> <path id="tp-0-kqj" d="M 45 55 L 245 55"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-kqj">kqj 'do something'</textPath></text>
  <circle id="p-bai" cx="30" cy="25" r="5" fill="#3cb44b" /> <path id="tp-0-bai" d="M 45 30 L 245 30"/> <text><textPath xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tp-0-bai">bai 'do something2'</textPath></text>
</svg>